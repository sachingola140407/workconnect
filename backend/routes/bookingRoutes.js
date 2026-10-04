const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/bookings
 * @desc    Submit a service request (Customer, Professional, or Admin)
 * @access  Private
 */
router.post('/', bookingController.createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get user's booking history or professional's jobs
 * @access  Private
 */
router.get('/', bookingController.getMyBookings);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update job status (Accepted, On the way, Arrived, Working, Completed, etc.)
 * @access  Private
 */
router.patch('/:id/status', bookingController.updateBookingStatus);

/**
 * @route   GET /api/bookings/:id/track
 * @desc    Get live tracking details, ETA, and coordinates
 * @access  Private
 */
router.get('/:id/track', bookingController.getTracking);

/**
 * @route   PATCH /api/bookings/:id/track-location
 * @desc    Update professional moving coordinates
 * @access  Private
 */
router.patch('/:id/track-location', bookingController.updateTrackingLocation);

module.exports = router;
