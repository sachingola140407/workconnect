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

/**
 * @route   GET /api/admin/professionals/activity
 * @desc    Get all professionals' activity, acceptance & completion rates
 * @access  Private (Admin only)
 */
router.get('/professionals/activity', adminController.getProfessionalActivity);

/**
 * @route   GET /api/admin/professionals/:id/jobs
 * @desc    Get detailed job audit log for a specific professional
 * @access  Private (Admin only)
 */
router.get('/professionals/:id/jobs', adminController.getProfessionalJobHistory);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all platform bookings
 * @access  Private (Admin only)
 */
router.get('/bookings', adminController.getBookings);

/**
 * @route   GET /api/admin/tracking
 * @desc    Get active trackable bookings for admin live map
 * @access  Private (Admin only)
 */
router.get('/tracking', adminController.getActiveTracking);

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments
 * @access  Private (Admin only)
 */
router.get('/payments', adminController.getPayments);

/**
 * @route   GET /api/admin/invoices
 * @desc    Get all invoices
 * @access  Private (Admin only)
 */
router.get('/invoices', adminController.getInvoices);

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all reviews for moderation
 * @access  Private (Admin only)
 */
router.get('/reviews', adminController.getReviews);
router.delete('/reviews/:id', adminController.deleteReview);

/**
 * @route   GET /api/admin/complaints
 * @desc    Get and update user complaints
 * @access  Private (Admin only)
 */
router.get('/complaints', adminController.getComplaints);
router.patch('/complaints/:id/status', adminController.updateComplaint);

/**
 * @route   GET /api/admin/reports
 * @desc    Get platform reports and revenue statistics
 * @access  Private (Admin only)
 */
router.get('/reports', adminController.getReports);

/**
 * @route   GET /api/admin/config
 * @desc    Get platform configuration including centralized platform fee
 * @access  Private (Admin only)
 */
router.get('/config', adminController.getPlatformConfig);

module.exports = router;
