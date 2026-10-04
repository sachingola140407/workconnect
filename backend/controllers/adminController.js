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

/**
 * Get professional activity and acceptance/completion performance (Admin only)
 */
async function getProfessionalActivity(req, res, next) {
  try {
    const { search } = req.query;
    const activities = await Professional.getActivityStats({ search });

    // Compute aggregated platform summary
    const totalRequests = activities.reduce((sum, p) => sum + (p.total_requests || 0), 0);
    const totalAccepted = activities.reduce((sum, p) => sum + (p.accepted_requests || 0), 0);
    const totalCompleted = activities.reduce((sum, p) => sum + (p.completed_requests || 0), 0);
    const totalEarnings = activities.reduce((sum, p) => sum + (p.total_earnings || 0), 0);
    const platformAcceptanceRate = totalRequests > 0 ? Math.round((totalAccepted / totalRequests) * 1000) / 10 : 0;
    const platformCompletionRate = totalAccepted > 0 ? Math.round((totalCompleted / totalAccepted) * 1000) / 10 : 0;

    return successResponse(res, 200, 'Professional activity stats retrieved', {
      summary: {
        total_professionals: activities.length,
        total_requests: totalRequests,
        total_accepted: totalAccepted,
        total_completed: totalCompleted,
        platform_acceptance_rate: platformAcceptanceRate,
        platform_completion_rate: platformCompletionRate,
        total_platform_earnings: totalEarnings,
      },
      professionals: activities,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get detailed job history of a specific professional (Admin only)
 */
async function getProfessionalJobHistory(req, res, next) {
  try {
    const { id } = req.params;
    const jobs = await Professional.getJobHistory(id);
    const professional = await Professional.findById(id);

    const totalRequests = jobs.length;
    const acceptedRequests = jobs.filter(
      (j) => j.status !== 'pending' && j.status !== 'rejected' && j.status !== 'cancelled'
    ).length;
    const completedRequests = jobs.filter((j) => j.status === 'completed').length;
    const totalEarnings = jobs
      .filter((j) => j.status === 'completed')
      .reduce(
        (sum, j) => sum + (parseFloat(j.price) || 0) + (parseFloat(j.visiting_charge) || 0),
        0
      );
    const acceptanceRate =
      totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 1000) / 10 : 0;
    const completionRate =
      acceptedRequests > 0 ? Math.round((completedRequests / acceptedRequests) * 1000) / 10 : 0;

    return successResponse(res, 200, 'Professional job history retrieved', {
      professional,
      stats: {
        total_requests: totalRequests,
        accepted_requests: acceptedRequests,
        completed_requests: completedRequests,
        total_earnings: totalEarnings,
        acceptance_rate: acceptanceRate,
        completion_rate: completionRate,
      },
      jobs,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  setUserStatus,
  verifyProfessional,
  getStats,
  getProfessionalActivity,
  getProfessionalJobHistory,
};
