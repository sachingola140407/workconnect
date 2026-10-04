const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
const serviceRoutes = require('./serviceRoutes');
const professionalRoutes = require('./professionalRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const db = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    System health check & DB status
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    const dbResult = await db.query('SELECT NOW() as db_time, postgis_version() as postgis');
    const latency = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      service: 'Fixigo API',
      status: 'operational',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: latency,
        time: dbResult.rows[0].db_time,
        postgis: dbResult.rows[0].postgis,
      },
      phase: 'Phase 2 - Professional Profiles, Services & Matching',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      service: 'Fixigo API',
      status: 'degraded',
      error: error.message,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/services', serviceRoutes);
router.use('/professionals', professionalRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
