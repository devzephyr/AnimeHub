require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDb } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const {
  authRoutes,
  titleRoutes,
  reviewRoutes,
  watchlistRoutes
} = require('./routes');

// Initialize express
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anime Hub API',
    endpoints: '/api/health'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Anime Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// One-time seed endpoint (protected by SEED_SECRET)
app.post('/api/seed', async (req, res) => {
  const { secret } = req.body;
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Invalid seed secret' });
  }
  try {
    const runSeed = require('./seed/seedData');
    const counts = await runSeed();
    res.json({ success: true, message: 'Database seeded', data: counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seed from Jikan/MAL endpoint (protected by SEED_SECRET)
app.post('/api/seed/jikan', async (req, res) => {
  const { secret, pages = 10 } = req.body;
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Invalid seed secret' });
  }
  try {
    const { pool } = require('./config/db');
    // Get admin user to set as creator
    const { rows } = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const adminId = rows[0]?.id || null;

    const seedFromJikan = require('./seed/jikanSeed');
    const counts = await seedFromJikan({ pages: Math.min(pages, 40), adminUserId: adminId });
    res.json({ success: true, message: 'Jikan seed complete', data: counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server after DB initialization
const PORT = process.env.PORT || 5000;

const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

module.exports = app;
