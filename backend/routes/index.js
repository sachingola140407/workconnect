const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const adminRoutes = require('./adminRoutes');
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
      service: 'WorkConnect API',
      status: 'operational',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: latency,
        time: dbResult.rows[0].db_time,
        postgis: dbResult.rows[0].postgis,
      },
      phase: 'Phase 1 - Authentication + Database + User Roles',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      service: 'WorkConnect API',
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

module.exports = router;
