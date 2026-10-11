const User = require('../models/User');
const Professional = require('../models/Professional');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const constants = require('../config/constants');
const db = require('../config/db');
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

/**
 * Get all platform bookings with filtering (Admin only)
 */
async function getBookings(req, res, next) {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const result = await Booking.getAll({
      status: status || undefined,
      search: search || undefined,
      limit: limitNum,
      offset,
    });

    return successResponse(res, 200, 'Bookings retrieved successfully', {
      bookings: result.bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get active trackable bookings for admin live map
 */
async function getActiveTracking(req, res, next) {
  try {
    const bookings = await Booking.getActiveTrackableBookings();
    return successResponse(res, 200, 'Active tracking bookings retrieved', bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * Get all payment records (Admin only)
 */
async function getPayments(req, res, next) {
  try {
    const { status, paymentMethod, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const result = await Payment.getAll({
      status: status || undefined,
      paymentMethod: paymentMethod || undefined,
      limit: limitNum,
      offset,
    });

    return successResponse(res, 200, 'Payments retrieved successfully', {
      payments: result.payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all invoices (Admin only)
 */
async function getInvoices(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const invoices = await Invoice.getAll({ limit: limitNum, offset });
    return successResponse(res, 200, 'Invoices retrieved successfully', invoices);
  } catch (err) {
    next(err);
  }
}

/**
 * Get all reviews (Admin moderation)
 */
async function getReviews(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const result = await Review.getAll({ limit: limitNum, offset });
    return successResponse(res, 200, 'Reviews retrieved successfully', result);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a review (Admin moderation)
 */
async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Review.delete(id);
    if (!deleted) {
      return errorResponse(res, 404, 'Review not found');
    }
    return successResponse(res, 200, 'Review deleted successfully', deleted);
  } catch (err) {
    next(err);
  }
}

/**
 * Get all complaints (Admin)
 */
async function getComplaints(req, res, next) {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const result = await Complaint.getAll({
      status: status || undefined,
      limit: limitNum,
      offset,
    });
    return successResponse(res, 200, 'Complaints retrieved successfully', result);
  } catch (err) {
    next(err);
  }
}

/**
 * Update complaint status & admin notes
 */
async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const valid = ['open', 'under_investigation', 'resolved', 'dismissed'];
    if (!valid.includes(status)) {
      return errorResponse(res, 400, `Status must be one of: ${valid.join(', ')}`);
    }
    const updated = await Complaint.updateStatus(id, { status, adminNotes });
    if (!updated) {
      return errorResponse(res, 404, 'Complaint not found');
    }
    return successResponse(res, 200, 'Complaint updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

/**
 * Platform Reports with date filters
 */
async function getReports(req, res, next) {
  try {
    const { range = '30days' } = req.query;
    let days = 30;
    if (range === 'today') days = 1;
    else if (range === '7days') days = 7;
    else if (range === '90days') days = 90;

    const query = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'completed'), 0) AS total_revenue,
        COALESCE(SUM(platform_fee) FILTER (WHERE payment_status = 'completed'), 0) AS platform_fees,
        COALESCE(SUM(final_service_amount) FILTER (WHERE payment_status = 'completed'), 0) AS pro_earnings
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;
    const { rows: dailyData } = await db.query(query);

    const categoryQuery = `
      SELECT 
        s.name AS service_name,
        s.category,
        COUNT(b.id) AS booking_count,
        COALESCE(SUM(b.total_amount), 0) AS total_amount
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY s.name, s.category
      ORDER BY booking_count DESC;
    `;
    const { rows: categoryData } = await db.query(categoryQuery);

    return successResponse(res, 200, 'Reports retrieved successfully', {
      range,
      days,
      dailyData,
      categoryData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Platform Config / Central Platform Fee
 */
async function getPlatformConfig(req, res, next) {
  try {
    return successResponse(res, 200, 'Platform configuration', {
      platformFee: constants.PLATFORM_FEE,
      maxServiceRadiusKm: constants.MAX_SERVICE_RADIUS_KM,
      defaultVisitingFee: constants.DEFAULT_VISITING_FEE,
      brandName: 'SabFix',
      tagline: 'Get It Fixed.',
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
  getBookings,
  getActiveTracking,
  getPayments,
  getInvoices,
  getReviews,
  deleteReview,
  getComplaints,
  updateComplaint,
  getReports,
  getPlatformConfig,
};
