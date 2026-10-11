const AuthService = require('../services/authService');
const { successResponse } = require('../utils/response');

/**
 * Handle user registration
 */
async function register(req, res, next) {
  try {
    const { name, email, phone, password, role, professionalDetails } = req.body;
    const result = await AuthService.register({
      name,
      email,
      phone,
      password,
      role,
      professionalDetails,
    });

    return successResponse(res, 201, 'Registration successful', result);
  } catch (err) {
    next(err);
  }
}

/**
 * Handle user login
 */
async function login(req, res, next) {
  try {
    const { email, phone, password, role } = req.body;
    const result = await AuthService.login({ email: email || phone, password, role });

    return successResponse(res, 200, 'Login successful', result);
  } catch (err) {
    next(err);
  }
}

/**
 * Handle instant mobile-only login (No password/email needed)
 */
async function mobileLogin(req, res, next) {
  try {
    const { phone, role } = req.body;
    const result = await AuthService.mobileLogin({ phone, role });

    return successResponse(res, 200, 'Mobile login successful', result);
  } catch (err) {
    next(err);
  }
}

/**
 * Handle instant mobile-only registration
 */
async function mobileRegister(req, res, next) {
  try {
    const { name, phone, role, professionalDetails } = req.body;
    const result = await AuthService.mobileRegister({
      name,
      phone,
      role,
      professionalDetails,
    });

    return successResponse(res, 201, 'Mobile registration successful', result);
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user
 */
async function getMe(req, res, next) {
  try {
    const user = await AuthService.getCurrentUser(req.user.id);
    return successResponse(res, 200, 'Current user retrieved', user);
  } catch (err) {
    next(err);
  }
}

/**
 * Handle user logout
 */
async function logout(req, res, next) {
  try {
    return successResponse(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  mobileLogin,
  mobileRegister,
  getMe,
  logout,
};
