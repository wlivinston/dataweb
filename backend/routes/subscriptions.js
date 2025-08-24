const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendSubscriptionEmail, sendUnsubscribeEmail } = require('../services/emailService');

const router = express.Router();

// Subscribe to newsletter (public endpoint)
router.post('/newsletter', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('source').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, first_name, last_name, source } = req.body;

    // Check if already subscribed
    const existingSubscriber = await query(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = $1',
      [email]
    );

    if (existingSubscriber.rows.length > 0) {
      const subscriber = existingSubscriber.rows[0];
      
      if (subscriber.is_active) {
        return res.status(400).json({ error: 'Email is already subscribed to the newsletter' });
      } else {
        // Reactivate subscription
        await query(
          'UPDATE newsletter_subscribers SET is_active = true, unsubscribed_at = NULL, source = COALESCE($1, source) WHERE id = $2',
          [source, subscriber.id]
        );
        
        await sendSubscriptionEmail(email, first_name || 'Subscriber');
        
        return res.json({ message: 'Newsletter subscription reactivated successfully' });
      }
    }

    // Create new subscription
    const result = await query(
      `INSERT INTO newsletter_subscribers (email, first_name, last_name, source)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, first_name, last_name, source]
    );

    const subscriber = result.rows[0];

    // Send welcome email
    await sendSubscriptionEmail(email, first_name || 'Subscriber');

    res.status(201).json({
      message: 'Newsletter subscription successful',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        first_name: subscriber.first_name,
        last_name: subscriber.last_name
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

// Unsubscribe from newsletter
router.post('/newsletter/unsubscribe', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const result = await query(
      'UPDATE newsletter_subscribers SET is_active = false, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = $1 AND is_active = true RETURNING id, first_name',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found or already unsubscribed' });
    }

    const subscriber = result.rows[0];

    // Send unsubscribe confirmation email
    await sendUnsubscribeEmail(email, subscriber.first_name || 'Subscriber');

    res.json({ message: 'Successfully unsubscribed from newsletter' });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
});

// Get subscription plans (public endpoint)
router.get('/plans', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, description, price, billing_cycle, features, is_active FROM subscription_plans WHERE is_active = true ORDER BY price ASC',
      []
    );

    res.json({ plans: result.rows });

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Create customer subscription (requires authentication)
router.post('/subscribe', authenticateToken, [
  body('plan_id').isInt({ min: 1 }),
  body('payment_method').optional().trim(),
  body('auto_renew').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan_id, payment_method, auto_renew = true } = req.body;

    // Check if plan exists
    const planResult = await query(
      'SELECT id, name, price, billing_cycle FROM subscription_plans WHERE id = $1 AND is_active = true',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const plan = planResult.rows[0];

    // Check if user already has an active subscription
    const existingSubscription = await query(
      'SELECT id, status FROM customer_subscriptions WHERE customer_id = $1 AND status IN ($2, $3)',
      [req.user.id, 'active', 'pending']
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an active subscription' });
    }

    // Calculate subscription dates
    const startDate = new Date();
    let endDate = new Date();
    
    switch (plan.billing_cycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription
    const subscriptionResult = await query(
      `INSERT INTO customer_subscriptions (customer_id, plan_id, status, start_date, end_date, auto_renew, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, customer_id, plan_id, status, start_date, end_date`,
      [req.user.id, plan_id, 'pending', startDate, endDate, auto_renew, payment_method]
    );

    const subscription = subscriptionResult.rows[0];

    // Create initial payment record
    await query(
      `INSERT INTO subscription_payments (subscription_id, amount, currency, payment_method, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [subscription.id, plan.price, 'USD', payment_method, 'pending']
    );

    // Update customer subscription status
    await query(
      'UPDATE customers SET subscription_status = $1 WHERE id = $2',
      [plan.name.toLowerCase(), req.user.id]
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        plan: plan.name,
        status: subscription.status,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        price: plan.price,
        billing_cycle: plan.billing_cycle
      }
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get user's current subscription
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        cs.id, cs.status, cs.start_date, cs.end_date, cs.auto_renew, cs.payment_method,
        sp.name as plan_name, sp.description as plan_description, sp.price, sp.billing_cycle, sp.features
       FROM customer_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE cs.customer_id = $1 AND cs.status IN ('active', 'pending')
       ORDER BY cs.created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ subscription: null });
    }

    const subscription = result.rows[0];

    // Get payment history
    const paymentsResult = await query(
      'SELECT id, amount, currency, payment_method, status, payment_date FROM subscription_payments WHERE subscription_id = $1 ORDER BY payment_date DESC',
      [subscription.id]
    );

    res.json({
      subscription: {
        ...subscription,
        payments: paymentsResult.rows
      }
    });

  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `UPDATE customer_subscriptions 
       SET status = 'cancelled', auto_renew = false, updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $1 AND status = 'active'
       RETURNING id, end_date`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = result.rows[0];

    // Update customer status
    await query(
      'UPDATE customers SET subscription_status = $1 WHERE id = $2',
      ['cancelled', req.user.id]
    );

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: {
        id: subscription.id,
        status: 'cancelled',
        end_date: subscription.end_date
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/reactivate', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `UPDATE customer_subscriptions 
       SET status = 'active', auto_renew = true, updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $1 AND status = 'cancelled'
       RETURNING id, plan_id`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No cancelled subscription found' });
    }

    const subscription = result.rows[0];

    // Get plan details
    const planResult = await query(
      'SELECT name FROM subscription_plans WHERE id = $1',
      [subscription.plan_id]
    );

    if (planResult.rows.length > 0) {
      await query(
        'UPDATE customers SET subscription_status = $1 WHERE id = $2',
        [planResult.rows[0].name.toLowerCase(), req.user.id]
      );
    }

    res.json({
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription.id,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Get subscription history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        cs.id, cs.status, cs.start_date, cs.end_date, cs.auto_renew, cs.created_at,
        sp.name as plan_name, sp.price, sp.billing_cycle
       FROM customer_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE cs.customer_id = $1
       ORDER BY cs.created_at DESC`,
      [req.user.id]
    );

    res.json({ subscriptions: result.rows });

  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription history' });
  }
});

// Admin: Get all subscriptions
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.subscription_status !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [limit, offset];
    let paramIndex = 3;

    if (status) {
      whereClause = `WHERE cs.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const result = await query(
      `SELECT 
        cs.id, cs.status, cs.start_date, cs.end_date, cs.auto_renew, cs.created_at,
        sp.name as plan_name, sp.price, sp.billing_cycle,
        c.email, c.first_name, c.last_name, c.company
       FROM customer_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       JOIN customers c ON cs.customer_id = c.id
       ${whereClause}
       ORDER BY cs.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM customer_subscriptions cs ${whereClause}`,
      status ? [status] : []
    );

    res.json({
      subscriptions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });

  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Admin: Update subscription status
router.put('/admin/:subscriptionId/status', authenticateToken, [
  body('status').isIn(['active', 'cancelled', 'expired', 'pending'])
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

    const { subscriptionId } = req.params;
    const { status } = req.body;

    const result = await query(
      'UPDATE customer_subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, customer_id, status',
      [status, subscriptionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const subscription = result.rows[0];

    // Update customer subscription status
    await query(
      'UPDATE customers SET subscription_status = $1 WHERE id = $2',
      [status, subscription.customer_id]
    );

    res.json({
      message: 'Subscription status updated successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status
      }
    });

  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

module.exports = router;
