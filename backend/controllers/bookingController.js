const Booking = require('../models/Booking');
const Professional = require('../models/Professional');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Create a new service booking request (Customer only)
 */
async function createBooking(req, res, next) {
  try {
    const {
      professionalId,
      serviceId,
      price,
      customerAddress,
      notes,
      scheduledAt,
      customerLocation,
    } = req.body;

    if (!professionalId || !serviceId) {
      return errorResponse(res, 400, 'professionalId and serviceId are required');
    }

    if (!customerAddress || customerAddress.trim().length < 3) {
      return errorResponse(res, 400, 'A valid customer address is required');
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      professionalId,
      serviceId,
      price: parseFloat(price) || 0,
      customerAddress,
      notes,
      scheduledAt,
      customerLocation,
    });

    return successResponse(res, 201, 'Booking request sent to professional successfully', booking);
  } catch (err) {
    next(err);
  }
}

/**
 * Get bookings for the currently authenticated user
 */
async function getMyBookings(req, res, next) {
  try {
    let bookings = [];
    if (req.user.role === 'professional') {
      bookings = await Booking.getByProfessionalId(req.user.id);
    } else {
      bookings = await Booking.getByCustomerId(req.user.id);
    }

    return successResponse(res, 200, 'Bookings retrieved successfully', bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * Update booking status (e.g. accepted, on_the_way, completed, rejected)
 */
async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'accepted',
      'rejected',
      'on_the_way',
      'arrived',
      'working',
      'completed',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const updated = await Booking.updateStatus(id, status);
    if (!updated) {
      return errorResponse(res, 404, 'Booking not found');
    }

    return successResponse(res, 200, `Booking status updated to '${status}'`, updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
