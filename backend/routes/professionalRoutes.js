const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');

/**
 * @route   GET /api/professionals
 * @desc    Search and filter nearby professionals by service, distance, rating
 * @access  Public
 */
router.get('/', professionalController.getProfessionals);

/**
 * @route   GET /api/professionals/:id
 * @desc    Get detailed professional profile
 * @access  Public
 */
router.get('/:id', professionalController.getProfessionalById);

module.exports = router;
