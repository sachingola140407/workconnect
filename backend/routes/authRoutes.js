const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Customer or Professional)
 * @access  Public
 */
router.post('/register', authRateLimiter, validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', authRateLimiter, validateLogin, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (Any authenticated role)
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user (client invalidates token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;
