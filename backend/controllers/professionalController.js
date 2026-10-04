const Professional = require('../models/Professional');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Search professionals with PostGIS geospatial matching and category filters
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
      radius = 25,
      sortBy = 'best_match',
    } = req.query;

    const professionals = await Professional.searchNearby({
      service,
      serviceId,
      search,
      isAvailable,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      radiusKm: radius ? parseFloat(radius) : 25,
      sortBy,
    });

    return successResponse(res, 200, 'Professionals retrieved successfully', {
      total: professionals.length,
      filter: {
        service: service || 'all',
        hasLocation: !!(lat && lng),
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
    const professional = await Professional.getById(id);

    if (!professional) {
      return errorResponse(res, 404, 'Professional not found');
    }

    return successResponse(res, 200, 'Professional profile retrieved', professional);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfessionals,
  getProfessionalById,
};
