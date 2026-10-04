const User = require('../models/User');
const Professional = require('../models/Professional');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get current user profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findWithProfile(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    return successResponse(res, 200, 'User profile retrieved', user);
  } catch (err) {
    next(err);
  }
}

/**
 * Update user basic profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, phone, avatarUrl } = req.body;
    const updatedUser = await User.update(req.user.id, { name, phone, avatarUrl });
    return successResponse(res, 200, 'Profile updated successfully', updatedUser);
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle professional availability (Professional only)
 */
async function toggleAvailability(req, res, next) {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return errorResponse(res, 400, 'isAvailable must be a boolean');
    }

    const updated = await Professional.setAvailability(req.user.id, isAvailable);
    if (!updated) {
      return errorResponse(res, 404, 'Professional profile not found');
    }

    return successResponse(res, 200, `Availability updated to ${isAvailable ? 'available' : 'unavailable'}`, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Update professional profile details (Professional only)
 */
async function updateProfessionalProfile(req, res, next) {
  try {
    const { bio, experience, price, address } = req.body;
    const updated = await Professional.updateProfile(req.user.id, {
      bio,
      experience: experience !== undefined ? parseInt(experience, 10) : undefined,
      price: price !== undefined ? parseFloat(price) : undefined,
      address,
    });

    if (!updated) {
      return errorResponse(res, 404, 'Professional profile not found');
    }

    return successResponse(res, 200, 'Professional details updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  toggleAvailability,
  updateProfessionalProfile,
};
