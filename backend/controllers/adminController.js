const User = require('../models/User');
const Professional = require('../models/Professional');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all users with filtering and pagination (Admin only)
 */
async function getUsers(req, res, next) {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { users, total } = await User.getAll({
      role: role || undefined,
      search: search || undefined,
      limit: limitNum,
      offset,
    });

    return successResponse(res, 200, 'Users retrieved successfully', {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle user active/blocked status (Admin only)
 */
async function setUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 400, 'isActive must be a boolean');
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.id && !isActive) {
      return errorResponse(res, 400, 'You cannot deactivate your own admin account');
    }

    const updatedUser = await User.setStatus(id, isActive);
    if (!updatedUser) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(
      res,
      200,
      `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      updatedUser
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Verify or unverify a professional (Admin only)
 */
async function verifyProfessional(req, res, next) {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return errorResponse(res, 400, 'isVerified must be a boolean');
    }

    const updated = await Professional.setVerification(id, isVerified);
    if (!updated) {
      return errorResponse(res, 404, 'Professional not found');
    }

    return successResponse(
      res,
      200,
      `Professional verification updated to: ${isVerified ? 'Verified' : 'Unverified'}`,
      updated
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get platform summary statistics (Admin only)
 */
async function getStats(req, res, next) {
  try {
    const stats = await User.getStats();
    return successResponse(res, 200, 'Platform statistics retrieved', stats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  setUserStatus,
  verifyProfessional,
  getStats,
};
