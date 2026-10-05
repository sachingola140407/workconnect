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

    let professionals = await Professional.searchNearby({
      service,
      serviceId,
      search,
      isAvailable,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      radiusKm: radius ? parseFloat(radius) : 50,
      sortBy,
    });

    // Graceful fallback: If strict radius filter returned 0 results, search nearest available specialists
    if (professionals.length === 0 && lat && lng) {
      professionals = await Professional.searchNearby({
        service,
        serviceId,
        search,
        isAvailable,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radiusKm: null, // no boundary, just distance sorted
        sortBy: 'distance',
      });
    }

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
