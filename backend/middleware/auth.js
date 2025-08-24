const { supabase } = require('../config/supabase')

// Middleware to verify Supabase JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get additional user data from customers table
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name, company, is_active, subscription_status')
      .eq('email', user.email)
      .single()

    if (customerError) {
      console.error('Error fetching customer data:', customerError)
      return res.status(500).json({ error: 'Failed to fetch user data' })
    }

    if (!customerData || !customerData.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    // Combine Supabase user data with customer data
    req.user = {
      ...user,
      customer_id: customerData.id,
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      company: customerData.company,
      subscription_status: customerData.subscription_status
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      req.user = null
      return next()
    }

    // Get customer data
    const { data: customerData } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name, company, is_active, subscription_status')
      .eq('email', user.email)
      .single()

    if (customerData && customerData.is_active) {
      req.user = {
        ...user,
        customer_id: customerData.id,
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        company: customerData.company,
        subscription_status: customerData.subscription_status
      }
    } else {
      req.user = null
    }

    next()
  } catch (error) {
    req.user = null
    next()
  }
}

// Admin middleware (for future use)
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // Check if user has admin subscription status
  if (req.user.subscription_status !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

// Verify Supabase JWT token without database lookup
const verifyToken = async (token) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return { valid: false, user: null, error }
    }

    return { valid: true, user, error: null }
  } catch (error) {
    return { valid: false, user: null, error }
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  verifyToken
}
