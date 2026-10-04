const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Authentication Middleware
 * Validates JWT Bearer token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Unauthorized: Access token is missing');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      return errorResponse(res, 401, 'Unauthorized: Invalid or expired token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'Unauthorized: User account no longer exists');
    }

    if (!user.is_active) {
      return errorResponse(res, 403, 'Forbidden: User account is deactivated or blocked');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
};
