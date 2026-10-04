const { errorResponse } = require('../utils/response');

/**
 * Validate user registration request body
 */
function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  const validRoles = ['customer', 'professional'];
  if (!role || !validRoles.includes(role)) {
    errors.push("Role is required and must be either 'customer' or 'professional'");
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
}

/**
 * Validate login request body
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
}

/**
 * Validate profile update body
 */
function validateProfileUpdate(req, res, next) {
  const { name, phone } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters');
  }

  if (phone !== undefined && typeof phone !== 'string') {
    errors.push('Phone must be a valid string');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
};
