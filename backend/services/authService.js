const db = require('../config/db');
const User = require('../models/User');
const Professional = require('../models/Professional');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

class AuthService {
  /**
   * Register a new user (Customer or Professional)
   */
  static async register({ name, email, phone, password, role, professionalDetails = {} }) {
    // 1. Check if user already exists
    const existing = await User.findByEmail(email);
    if (existing) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Create user record
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role,
    });

    let professional = null;

    // 4. If professional role, create professional profile entry
    if (role === 'professional') {
      const proLng = professionalDetails.longitude !== undefined && professionalDetails.longitude !== null && !isNaN(professionalDetails.longitude)
        ? parseFloat(professionalDetails.longitude)
        : 77.2090;
      const proLat = professionalDetails.latitude !== undefined && professionalDetails.latitude !== null && !isNaN(professionalDetails.latitude)
        ? parseFloat(professionalDetails.latitude)
        : 28.6139;

      professional = await Professional.create({
        userId: user.id,
        bio: professionalDetails.bio || `Hello, I'm ${name}, a professional specialist on SabFix.`,
        experience: professionalDetails.experience || 3,
        price: professionalDetails.price || 350,
        address: professionalDetails.address || 'Delhi NCR',
        longitude: proLng,
        latitude: proLat,
      });

      // Link selected service if provided
      if (professionalDetails.serviceId) {
        try {
          await db.query(
            `INSERT INTO professional_services (professional_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [professional.id, professionalDetails.serviceId]
          );
        } catch (linkErr) {
          console.error('[AuthService] Error linking professional service:', linkErr);
        }
      }
    }

    // 5. Generate JWT token
    const token = signToken(user);

    return {
      user: {
        ...user,
        professional,
      },
      token,
    };
  }

  /**
   * Authenticate user with email and password
   */
  static async login({ email, password }) {
    // 1. Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 2. Check if user is active
    if (!user.is_active) {
      const error = new Error('Your account is deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Compare password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 4. Exclude password_hash from response
    delete user.password_hash;

    // 5. If professional, fetch professional profile
    let professional = null;
    if (user.role === 'professional') {
      professional = await Professional.findByUserId(user.id);
    }

    // 6. Generate JWT token
    const token = signToken(user);

    return {
      user: {
        ...user,
        professional,
      },
      token,
    };
  }

  /**
   * Get current authenticated user's complete profile
   */
  static async getCurrentUser(userId) {
    const userWithProfile = await User.findWithProfile(userId);
    if (!userWithProfile) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    let professional = null;
    if (userWithProfile.role === 'professional' && userWithProfile.professional_id) {
      professional = {
        id: userWithProfile.professional_id,
        bio: userWithProfile.bio,
        experience: userWithProfile.experience,
        rating: userWithProfile.rating,
        reviewCount: userWithProfile.review_count,
        price: userWithProfile.price,
        isAvailable: userWithProfile.is_available,
        isVerified: userWithProfile.is_verified,
        address: userWithProfile.address,
        longitude: userWithProfile.longitude,
        latitude: userWithProfile.latitude,
      };
    }

    return {
      id: userWithProfile.id,
      name: userWithProfile.name,
      email: userWithProfile.email,
      phone: userWithProfile.phone,
      role: userWithProfile.role,
      avatarUrl: userWithProfile.avatar_url,
      isActive: userWithProfile.is_active,
      createdAt: userWithProfile.created_at,
      updatedAt: userWithProfile.updated_at,
      professional,
    };
  }
}

module.exports = AuthService;
