const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All booking routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/bookings
 * @desc    Submit a service request (Customer only)
 * @access  Private (Customer)
 */
router.post('/', authorize('customer'), bookingController.createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get user's booking history or professional's jobs
 * @access  Private (Customer or Professional)
 */
router.get('/', bookingController.getMyBookings);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update job status (Accepted, On the way, Arrived, Working, Completed, etc.)
 * @access  Private (Professional or Admin)
 */
router.patch('/:id/status', authorize('professional', 'admin'), bookingController.updateBookingStatus);

module.exports = router;
