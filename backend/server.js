const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const apiRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { apiRateLimiter } = require('./middleware/rateLimitMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl, postman) or matching frontend
    if (!origin || origin === CLIENT_URL || origin === 'http://127.0.0.1:5173') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// 2. Request Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Simple Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 4. Rate Limiting for general API
app.use('/api', apiRateLimiter);

// 5. Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Fixigo API - On-Demand Local Services & Home Repairs',
    version: '1.0.0',
    documentation: '/api/health',
    phase: 'Fixigo - Professional Profiles, Services & Booking System',
  });
});

// 6. Mount API Routes
app.use('/api', apiRoutes);

// 7. Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found on this server`,
  });
});

// 8. Global Error Handler
app.use(errorHandler);

// 9. Start Server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` Fixigo Backend Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` API Endpoint: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

module.exports = app;
