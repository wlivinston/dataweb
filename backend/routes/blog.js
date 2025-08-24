const express = require('express');
const matter = require('gray-matter');
const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all blog posts
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = ['published = true'];
    let params = [limit, offset];
    let paramIndex = 3;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (tag) {
      whereConditions.push(`$${paramIndex} = ANY(tags)`);
      params.push(tag);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM blog_posts WHERE ${whereClause}`,
      params.slice(2) // Remove limit and offset
    );
    const totalPosts = parseInt(countResult.rows[0].count);

    // Get posts
    const result = await query(
      `SELECT 
        id, slug, title, excerpt, author, category, tags, featured, 
        published_at, created_at, updated_at, read_time, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE ${whereClause}
       ORDER BY featured DESC, published_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    // Add user interaction data if authenticated
    const posts = result.rows.map(post => ({
      ...post,
      user_liked: false, // You can implement this based on user likes
      user_bookmarked: false // You can implement this based on user bookmarks
    }));

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      }
    });

  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get a single blog post by slug
router.get('/posts/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Get post from database
    const result = await query(
      `SELECT 
        id, slug, title, excerpt, content, author, category, tags, featured, 
        published_at, created_at, updated_at, read_time, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE slug = $1 AND published = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const post = result.rows[0];

    // Increment view count
    await query(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1',
      [post.id]
    );

    // Record page view for analytics
    await query(
      `INSERT INTO page_views (page_url, ip_address, user_agent, referrer)
       VALUES ($1, $2, $3, $4)`,
      [
        `/blog/${slug}`,
        req.ip,
        req.get('User-Agent'),
        req.get('Referrer')
      ]
    );

    // Get related posts
    const relatedResult = await query(
      `SELECT id, slug, title, excerpt, author, category, published_at, view_count
       FROM blog_posts 
       WHERE published = true 
       AND id != $1 
       AND (category = $2 OR $3 = ANY(tags))
       ORDER BY published_at DESC 
       LIMIT 3`,
      [post.id, post.category, post.tags?.[0] || null]
    );

    res.json({
      post: {
        ...post,
        user_liked: false, // You can implement this based on user likes
        user_bookmarked: false // You can implement this based on user bookmarks
      },
      related_posts: relatedResult.rows
    });

  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Like/unlike a blog post
router.post('/posts/:slug/like', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Get post
    const postResult = await query(
      'SELECT id FROM blog_posts WHERE slug = $1 AND published = true',
      [slug]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const post = postResult.rows[0];

    // For now, we'll use IP-based likes. In a real app, you'd want user-based likes
    const existingLike = await query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND ip_address = $2',
      [post.id, req.ip]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM post_likes WHERE post_id = $1 AND ip_address = $2',
        [post.id, req.ip]
      );

      await query(
        'UPDATE blog_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
        [post.id]
      );

      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await query(
        'INSERT INTO post_likes (post_id, ip_address) VALUES ($1, $2)',
        [post.id, req.ip]
      );

      await query(
        'UPDATE blog_posts SET like_count = like_count + 1 WHERE id = $1',
        [post.id]
      );

      res.json({ message: 'Post liked', liked: true });
    }

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
});

// Get blog categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        category,
        COUNT(*) as post_count
       FROM blog_posts 
       WHERE published = true 
       GROUP BY category 
       ORDER BY post_count DESC`,
      []
    );

    res.json({ categories: result.rows });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get blog tags
router.get('/tags', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        unnest(tags) as tag,
        COUNT(*) as post_count
       FROM blog_posts 
       WHERE published = true 
       GROUP BY tag 
       ORDER BY post_count DESC`,
      []
    );

    res.json({ tags: result.rows });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get featured posts
router.get('/featured', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id, slug, title, excerpt, author, category, tags, 
        published_at, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE published = true AND featured = true
       ORDER BY published_at DESC 
       LIMIT 5`,
      []
    );

    res.json({ posts: result.rows });

  } catch (error) {
    console.error('Get featured posts error:', error);
    res.status(500).json({ error: 'Failed to fetch featured posts' });
  }
});

// Get recent posts
router.get('/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const result = await query(
      `SELECT 
        id, slug, title, excerpt, author, category, tags, 
        published_at, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE published = true
       ORDER BY published_at DESC 
       LIMIT $1`,
      [limit]
    );

    res.json({ posts: result.rows });

  } catch (error) {
    console.error('Get recent posts error:', error);
    res.status(500).json({ error: 'Failed to fetch recent posts' });
  }
});

// Get popular posts
router.get('/popular', async (req, res) => {
  try {
    const { period = '30', limit = 10 } = req.query;

    const result = await query(
      `SELECT 
        id, slug, title, excerpt, author, category, tags, 
        published_at, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE published = true 
       AND published_at > CURRENT_TIMESTAMP - INTERVAL '${period} days'
       ORDER BY (view_count + like_count * 2 + comment_count * 3) DESC 
       LIMIT $1`,
      [limit]
    );

    res.json({ posts: result.rows });

  } catch (error) {
    console.error('Get popular posts error:', error);
    res.status(500).json({ error: 'Failed to fetch popular posts' });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = `%${q.trim()}%`;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM blog_posts 
       WHERE published = true 
       AND (title ILIKE $1 OR excerpt ILIKE $1 OR content ILIKE $1)`,
      [searchTerm]
    );
    const totalPosts = parseInt(countResult.rows[0].count);

    // Get posts
    const result = await query(
      `SELECT 
        id, slug, title, excerpt, author, category, tags, 
        published_at, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE published = true 
       AND (title ILIKE $1 OR excerpt ILIKE $1 OR content ILIKE $1)
       ORDER BY 
         CASE 
           WHEN title ILIKE $1 THEN 3
           WHEN excerpt ILIKE $1 THEN 2
           ELSE 1
         END DESC,
         published_at DESC
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset]
    );

    res.json({
      posts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      },
      search_query: q
    });

  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Get blog analytics (admin only)
router.get('/analytics', optionalAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.subscription_status !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get basic stats
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_posts,
        COUNT(CASE WHEN published = true THEN 1 END) as published_posts,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        SUM(comment_count) as total_comments
       FROM blog_posts`,
      []
    );

    // Get recent activity
    const recentActivityResult = await query(
      `SELECT 
        p.title, p.slug, p.published_at,
        COUNT(c.id) as new_comments,
        COUNT(pv.id) as new_views
       FROM blog_posts p
       LEFT JOIN blog_comments c ON p.id = c.post_id AND c.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
       LEFT JOIN page_views pv ON pv.page_url = CONCAT('/blog/', p.slug) AND pv.viewed_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
       WHERE p.published_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
       GROUP BY p.id, p.title, p.slug, p.published_at
       ORDER BY p.published_at DESC
       LIMIT 10`,
      []
    );

    // Get top posts by views
    const topPostsResult = await query(
      `SELECT 
        title, slug, view_count, like_count, comment_count
       FROM blog_posts 
       WHERE published = true
       ORDER BY view_count DESC 
       LIMIT 10`,
      []
    );

    res.json({
      stats: statsResult.rows[0],
      recent_activity: recentActivityResult.rows,
      top_posts: topPostsResult.rows
    });

  } catch (error) {
    console.error('Get blog analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch blog analytics' });
  }
});

// Import markdown files to database (admin only)
router.post('/import', optionalAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.subscription_status !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const blogsDir = path.join(__dirname, '../../src/blogs');
    
    if (!fs.existsSync(blogsDir)) {
      return res.status(404).json({ error: 'Blogs directory not found' });
    }

    const files = fs.readdirSync(blogsDir).filter(file => file.endsWith('.md'));
    const importedPosts = [];
    const errors = [];

    for (const file of files) {
      try {
        const filePath = path.join(blogsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        const slug = file.replace('.md', '');

        // Check if post already exists
        const existingPost = await query(
          'SELECT id FROM blog_posts WHERE slug = $1',
          [slug]
        );

        if (existingPost.rows.length > 0) {
          // Update existing post
          await query(
            `UPDATE blog_posts 
             SET title = $1, excerpt = $2, content = $3, author = $4, category = $5, 
                 tags = $6, featured = $7, updated_at = CURRENT_TIMESTAMP
             WHERE slug = $8`,
            [
              data.title || slug,
              data.excerpt || '',
              content,
              data.author || 'Admin',
              data.category || 'General',
              data.tags || [],
              data.featured || false,
              slug
            ]
          );
        } else {
          // Create new post
          await query(
            `INSERT INTO blog_posts (slug, title, excerpt, content, author, category, tags, featured, published)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              slug,
              data.title || slug,
              data.excerpt || '',
              content,
              data.author || 'Admin',
              data.category || 'General',
              data.tags || [],
              data.featured || false,
              true
            ]
          );
        }

        importedPosts.push(slug);
      } catch (error) {
        errors.push({ file, error: error.message });
      }
    }

    res.json({
      message: 'Import completed',
      imported: importedPosts.length,
      errors: errors.length,
      imported_posts: importedPosts,
      error_details: errors
    });

  } catch (error) {
    console.error('Import posts error:', error);
    res.status(500).json({ error: 'Failed to import posts' });
  }
});

module.exports = router;
