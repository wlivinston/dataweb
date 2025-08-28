// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const blogRoutes = require('./routes/blog');

// Supabase-based DB helpers (safe: no localhost:5432)
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

/* -------------------- Security -------------------- */
app.use(helmet());

/* -------------------- CORS (put CORS before rate limit & routes) -------------------- */
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,          // e.g. https://dataafrik.com  (set in DO env)
  'https://dataafrik.com',
  'https://www.dataafrik.com',
  'http://localhost:5173',           // Vite dev
]);

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server tools (no Origin header)
      if (!origin) return cb(null, true);
      const o = origin.replace(/\/$/, ''); // normalize trailing slash
      return cb(null, allowedOrigins.has(o));
    },
    credentials: true,
  })
);

/* -------------------- Rate limiting -------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

/* -------------------- Parsers -------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- Health -------------------- */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase_configured: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    message: 'Backend API is running',
  });
});

/* -------------------- API Routes -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/blog', blogRoutes);

/* -------------------- Error handling -------------------- */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message:
      process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

/* -------------------- 404 -------------------- */
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* -------------------- Start Server (then optional DB ping) -------------------- */
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });

    // Optional: non-blocking Supabase connectivity check
    try {
      await connectDB();
    } catch (error) {
      console.log('⚠️  Database connection attempt failed:', error.message);
      console.log('✅ Server continues running without database connection');
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
