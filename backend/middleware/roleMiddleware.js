const { errorResponse } = require('../utils/response');

/**
 * Role-Based Authorization Middleware
 * Ensures user has one of the allowed roles
 * @param {...string} allowedRoles - 'customer', 'professional', 'admin'
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized: User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
}

module.exports = {
  authorize,
};
