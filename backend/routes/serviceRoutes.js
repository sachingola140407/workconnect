const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

/**
 * @route   GET /api/services
 * @desc    Get all available services & categories
 * @access  Public
 */
router.get('/', serviceController.getAllServices);

module.exports = router;
