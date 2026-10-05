const Professional = require('../models/Professional');
const { MAX_SERVICE_RADIUS_KM } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Search professionals with PostGIS geospatial matching and category filters
 * Strictly enforces MAX_SERVICE_RADIUS_KM = 10 KM unless explicitly expanded
 */
async function getProfessionals(req, res, next) {
  try {
    const {
      service,
      serviceId,
      search,
      isAvailable,
      lat,
      lng,
      radius,
      expand,
      sortBy = 'best_match',
    } = req.query;

    const professionals = await Professional.searchNearby({
      service,
      serviceId,
      search,
      isAvailable,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      radiusKm: radius ? parseFloat(radius) : MAX_SERVICE_RADIUS_KM,
      expand: expand === 'true' || expand === true,
      sortBy,
    });

    return successResponse(res, 200, 'Professionals retrieved successfully', {
      total: professionals.length,
      filter: {
        service: service || 'all',
        hasLocation: !!(lat && lng),
        radiusKm: expand === 'true' ? (parseFloat(radius) || 50) : MAX_SERVICE_RADIUS_KM,
        sortBy,
      },
      professionals,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get professional detailed profile by ID
 */
async function getProfessionalById(req, res, next) {
  try {
    const { id } = req.params;
    const professional = await Professional.findById(id);

    if (!professional) {
      return errorResponse(res, 404, 'Professional not found');
    }

    return successResponse(res, 200, 'Professional profile retrieved', professional);
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle professional Online/Offline status (Prompt 2 Section 14)
 */
async function toggleOnlineStatus(req, res, next) {
  try {
    const { isOnline } = req.body;
    const updated = await Professional.setOnlineStatus(req.user.id, isOnline !== false);
    return successResponse(
      res,
      200,
      `Online status updated to ${isOnline !== false ? 'ONLINE' : 'OFFLINE'}`,
      updated
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Update professional's current location (Prompt 2 Section 8 & 20)
 */
async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude, address } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return errorResponse(res, 400, 'latitude and longitude are required');
    }

    const updated = await Professional.updateLocation(req.user.id, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
    });

    return successResponse(res, 200, 'Location updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfessionals,
  getProfessionalById,
  toggleOnlineStatus,
  updateLocation,
};
