const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/professionals
 * @desc    Search and filter nearby professionals by service, distance, rating
 * @access  Public
 */
router.get('/', professionalController.getProfessionals);

/**
 * @route   PATCH /api/professionals/status
 * @desc    Toggle professional online/offline status (Prompt 2 Section 14)
 * @access  Private (Professional)
 */
router.patch('/status', authenticate, professionalController.toggleOnlineStatus);

/**
 * @route   POST /api/professionals/location
 * @desc    Update professional GPS location (Prompt 2 Section 8 & 20)
 * @access  Private (Professional)
 */
router.post('/location', authenticate, professionalController.updateLocation);

/**
 * @route   GET /api/professionals/:id
 * @desc    Get detailed professional profile
 * @access  Public
 */
router.get('/:id', professionalController.getProfessionalById);

module.exports = router;
