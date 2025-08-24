const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get comments for a blog post
router.get('/post/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM blog_comments WHERE post_id = $1 AND is_approved = true AND is_spam = false',
      [postId]
    );
    const totalComments = parseInt(countResult.rows[0].count);

    // Get comments with replies
    const result = await query(
      `SELECT 
        c.id, c.post_id, c.parent_id, c.author_name, c.author_email, c.author_website, 
        c.content, c.is_approved, c.created_at, c.updated_at,
        COUNT(cl.id) as like_count,
        CASE WHEN $2::int IS NOT NULL THEN 
          EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND ip_address = $3)
        ELSE false END as user_liked
       FROM blog_comments c
       LEFT JOIN comment_likes cl ON c.id = cl.comment_id
       WHERE c.post_id = $1 AND c.is_approved = true AND c.is_spam = false
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $4 OFFSET $5`,
      [postId, req.user?.id || null, req.ip, limit, offset]
    );

    const comments = result.rows;

    // Organize comments into parent-child structure
    const commentMap = new Map();
    const topLevelComments = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    res.json({
      comments: topLevelComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment (requires authentication)
router.post('/', authenticateToken, [
  body('post_id').isInt({ min: 1 }),
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('parent_id').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { post_id, content, parent_id } = req.body;

    // Check if post exists
    const postResult = await query(
      'SELECT id FROM blog_posts WHERE id = $1 AND published = true',
      [post_id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // If this is a reply, check if parent comment exists
    if (parent_id) {
      const parentResult = await query(
        'SELECT id FROM blog_comments WHERE id = $1 AND post_id = $2 AND is_approved = true',
        [parent_id, post_id]
      );

      if (parentResult.rows.length === 0) {
        return res.status(400).json({ error: 'Parent comment not found' });
      }
    }

    // Create comment
    const result = await query(
      `INSERT INTO blog_comments (post_id, parent_id, author_name, author_email, content, ip_address, user_agent, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, post_id, parent_id, author_name, author_email, content, created_at`,
      [
        post_id,
        parent_id || null,
        `${req.user.first_name} ${req.user.last_name}`,
        req.user.email,
        content,
        req.ip,
        req.get('User-Agent'),
        true // Auto-approve authenticated users
      ]
    );

    const comment = result.rows[0];

    // Update comment count on blog post
    await query(
      'UPDATE blog_posts SET comment_count = (SELECT COUNT(*) FROM blog_comments WHERE post_id = $1 AND is_approved = true) WHERE id = $1',
      [post_id]
    );

    res.status(201).json({
      message: 'Comment posted successfully',
      comment: {
        ...comment,
        like_count: 0,
        user_liked: false,
        replies: []
      }
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Update a comment (only by the author)
router.put('/:commentId', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { commentId } = req.params;
    const { content } = req.body;

    // Check if comment exists and belongs to user
    const commentResult = await query(
      'SELECT id, author_email FROM blog_comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = commentResult.rows[0];

    if (comment.author_email !== req.user.email) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    // Update comment
    const result = await query(
      'UPDATE blog_comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, content, updated_at',
      [content, commentId]
    );

    res.json({
      message: 'Comment updated successfully',
      comment: result.rows[0]
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete a comment (only by the author or admin)
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if comment exists
    const commentResult = await query(
      'SELECT id, author_email, post_id FROM blog_comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = commentResult.rows[0];

    // Check if user is author or admin
    const isAuthor = comment.author_email === req.user.email;
    const isAdmin = req.user.subscription_status === 'admin'; // You might want to add a proper role field

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Delete comment and its replies
    await query(
      'DELETE FROM blog_comments WHERE id = $1 OR parent_id = $1',
      [commentId]
    );

    // Update comment count on blog post
    await query(
      'UPDATE blog_posts SET comment_count = (SELECT COUNT(*) FROM blog_comments WHERE post_id = $1 AND is_approved = true) WHERE id = $1',
      [comment.post_id]
    );

    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Like/unlike a comment
router.post('/:commentId/like', optionalAuth, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Check if comment exists
    const commentResult = await query(
      'SELECT id FROM blog_comments WHERE id = $1 AND is_approved = true',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user already liked this comment
    const existingLike = await query(
      'SELECT id FROM comment_likes WHERE comment_id = $1 AND ip_address = $2',
      [commentId, req.ip]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM comment_likes WHERE comment_id = $1 AND ip_address = $2',
        [commentId, req.ip]
      );

      res.json({ message: 'Comment unliked', liked: false });
    } else {
      // Like
      await query(
        'INSERT INTO comment_likes (comment_id, ip_address) VALUES ($1, $2)',
        [commentId, req.ip]
      );

      res.json({ message: 'Comment liked', liked: true });
    }

  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like/unlike comment' });
  }
});

// Get comment statistics for a post
router.get('/stats/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await query(
      `SELECT 
        COUNT(*) as total_comments,
        COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as top_level_comments,
        COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as replies,
        COUNT(CASE WHEN created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as recent_comments
       FROM blog_comments 
       WHERE post_id = $1 AND is_approved = true AND is_spam = false`,
      [postId]
    );

    res.json({ stats: result.rows[0] });

  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({ error: 'Failed to get comment statistics' });
  }
});

// Admin: Get pending comments for moderation
router.get('/admin/pending', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you might want to add a proper role field)
    if (req.user.subscription_status !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await query(
      `SELECT 
        c.id, c.post_id, c.parent_id, c.author_name, c.author_email, c.content, 
        c.is_approved, c.is_spam, c.created_at, c.ip_address,
        p.title as post_title, p.slug as post_slug
       FROM blog_comments c
       JOIN blog_posts p ON c.post_id = p.id
       WHERE c.is_approved = false OR c.is_spam = true
       ORDER BY c.created_at DESC`,
      []
    );

    res.json({ comments: result.rows });

  } catch (error) {
    console.error('Get pending comments error:', error);
    res.status(500).json({ error: 'Failed to get pending comments' });
  }
});

// Admin: Approve/reject comment
router.put('/admin/:commentId/moderate', authenticateToken, [
  body('action').isIn(['approve', 'reject', 'mark_spam'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user.subscription_status !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { commentId } = req.params;
    const { action } = req.body;

    let updateQuery;
    let updateParams;

    switch (action) {
      case 'approve':
        updateQuery = 'UPDATE blog_comments SET is_approved = true, is_spam = false WHERE id = $1';
        updateParams = [commentId];
        break;
      case 'reject':
        updateQuery = 'UPDATE blog_comments SET is_approved = false, is_spam = false WHERE id = $1';
        updateParams = [commentId];
        break;
      case 'mark_spam':
        updateQuery = 'UPDATE blog_comments SET is_spam = true, is_approved = false WHERE id = $1';
        updateParams = [commentId];
        break;
    }

    const result = await query(updateQuery, updateParams);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: `Comment ${action}d successfully` });

  } catch (error) {
    console.error('Moderate comment error:', error);
    res.status(500).json({ error: 'Failed to moderate comment' });
  }
});

module.exports = router;
