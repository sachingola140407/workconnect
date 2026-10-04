const Service = require('../models/Service');
const { successResponse } = require('../utils/response');

/**
 * Get all available services & categories
 */
async function getAllServices(req, res, next) {
  try {
    const services = await Service.getAll();
    return successResponse(res, 200, 'Services retrieved successfully', services);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllServices,
};
