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
      visitingCharge,
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
      visitingCharge: parseFloat(visitingCharge) || 99,
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
    const { role } = req.query;

    if (req.user.role === 'professional' && role !== 'customer') {
      bookings = await Booking.getByProfessionalId(req.user.id);
      // Fallback: If no professional jobs received yet, check if they made customer bookings
      if (bookings.length === 0) {
        const custBookings = await Booking.getByCustomerId(req.user.id);
        if (custBookings.length > 0) bookings = custBookings;
      }
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
      'work_completed',
      'payment_pending',
      'payment_completed',
      'completed',
      'cancelled',
      'reviewed',
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

/**
 * Get live location and ETA tracking details for real-time live map view
 */
async function getTracking(req, res, next) {
  try {
    const { id } = req.params;
    const tracking = await Booking.getTrackingDetails(id);

    if (!tracking) {
      return errorResponse(res, 404, 'Booking tracking details not found');
    }

    return successResponse(res, 200, 'Tracking details retrieved', tracking);
  } catch (err) {
    next(err);
  }
}

/**
 * Update professional's moving location coordinates (simulation / live GPS)
 */
async function updateTrackingLocation(req, res, next) {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return errorResponse(res, 400, 'latitude and longitude are required');
    }

    const updated = await Booking.updateTrackingLocation(id, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    if (!updated) {
      return errorResponse(res, 404, 'Booking or professional not found');
    }

    return successResponse(res, 200, 'Location updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getTracking,
  updateTrackingLocation,
};
