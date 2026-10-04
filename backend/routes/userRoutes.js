const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateProfileUpdate } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private (All roles)
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update basic user profile (name, phone, avatar)
 * @access  Private (All roles)
 */
router.put('/profile', validateProfileUpdate, userController.updateProfile);

/**
 * @route   PATCH /api/users/availability
 * @desc    Toggle availability status (Professional only)
 * @access  Private (Professional)
 */
router.patch('/availability', authorize('professional'), userController.toggleAvailability);

/**
 * @route   PUT /api/users/professional-profile
 * @desc    Update professional details (bio, experience, price, address)
 * @access  Private (Professional)
 */
router.put('/professional-profile', authorize('professional'), userController.updateProfessionalProfile);

module.exports = router;
