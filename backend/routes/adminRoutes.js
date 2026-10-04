const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and 'admin' role
router.use(authenticate, authorize('admin'));

/**
 * @route   GET /api/admin/stats
 * @desc    Get user and platform statistics
 * @access  Private (Admin only)
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/users', adminController.getUsers);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Activate or deactivate a user
 * @access  Private (Admin only)
 */
router.patch('/users/:id/status', adminController.setUserStatus);

/**
 * @route   PATCH /api/admin/professionals/:id/verify
 * @desc    Verify or unverify a professional
 * @access  Private (Admin only)
 */
router.patch('/professionals/:id/verify', adminController.verifyProfessional);

module.exports = router;
