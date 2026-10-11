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
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim() : null;
    const cleanName = name ? name.trim() : 'User';

    // 1. Check if user already exists
    const existing = await User.findByEmail(cleanEmail);
    if (existing) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Create user record
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
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
        bio: professionalDetails.bio || `Hello, I'm ${cleanName}, a professional specialist on SabFix.`,
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
   * Authenticate user with email or phone (password optional for customers/professionals)
   */
  static async login({ email, password, role }) {
    const cleanIdentifier = (email || '').trim();

    // 1. Find user by email or phone (optionally with role)
    let user = null;
    if (role && !cleanIdentifier.includes('@')) {
      user = await User.findByPhone(cleanIdentifier, role);
    }
    if (!user) {
      user = await User.findByEmailOrPhone(cleanIdentifier);
    }

    if (!user) {
      const error = new Error('No account found with this mobile number/email. Please register.');
      error.statusCode = 404;
      error.notRegistered = true;
      throw error;
    }

    // 2. Check if user is active
    if (!user.is_active) {
      const error = new Error('Your account is deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Password check: Required only if user has a password_hash or is admin
    if (user.role === 'admin' || (user.password_hash && password)) {
      if (!password) {
        const error = new Error('Password is required for this account');
        error.statusCode = 401;
        throw error;
      }
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        const error = new Error('Invalid email/mobile number or password');
        error.statusCode = 401;
        throw error;
      }
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
   * Fast mobile-only login (No password/gmail required)
   */
  static async mobileLogin({ phone, role = 'customer' }) {
    if (!phone) {
      const error = new Error('Mobile number is required');
      error.statusCode = 400;
      throw error;
    }

    const cleanDigits = String(phone).replace(/[^0-9]/g, '');
    const tenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    if (tenDigits.length < 10) {
      const error = new Error('Please enter a valid 10-digit mobile number');
      error.statusCode = 400;
      throw error;
    }

    // 1. Look for user matching this phone and role
    let user = await User.findByPhone(tenDigits, role);

    // If not found with specific role, check if user exists under any role
    if (!user) {
      const fallbackUser = await User.findByPhone(tenDigits);
      if (fallbackUser) {
        if (fallbackUser.role === role) {
          user = fallbackUser;
        } else {
          const targetRoleName = fallbackUser.role === 'customer' ? 'Customer' : 'Professional';
          const error = new Error(
            `This mobile number is registered as a ${fallbackUser.role}. Please select "${targetRoleName}" to log in.`
          );
          error.statusCode = 400;
          throw error;
        }
      }
    }

    if (!user) {
      const error = new Error('Mobile number not registered. Please complete quick registration.');
      error.statusCode = 404;
      error.notRegistered = true;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('Your account is deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    delete user.password_hash;

    let professional = null;
    if (user.role === 'professional') {
      professional = await Professional.findByUserId(user.id);
    }

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
   * Fast mobile-only registration
   */
  static async mobileRegister({ name, phone, role = 'customer', professionalDetails = {} }) {
    if (!phone) {
      const error = new Error('Mobile number is required');
      error.statusCode = 400;
      throw error;
    }

    const cleanDigits = String(phone).replace(/[^0-9]/g, '');
    const tenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    if (tenDigits.length < 10) {
      const error = new Error('Please enter a valid 10-digit mobile number');
      error.statusCode = 400;
      throw error;
    }

    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 2) {
      const error = new Error('Please enter your name (at least 2 characters)');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists with this phone and role
    const existing = await User.findByPhone(tenDigits, role);
    if (existing) {
      delete existing.password_hash;
      let professional = null;
      if (existing.role === 'professional') {
        professional = await Professional.findByUserId(existing.id);
      }
      const token = signToken(existing);
      return {
        user: {
          ...existing,
          professional,
        },
        token,
        alreadyExisted: true,
      };
    }

    const formattedPhone = `+91 ${tenDigits}`;
    const autoEmail = `${role}_${tenDigits}@sabfix.local`;

    const user = await User.create({
      name: cleanName,
      email: autoEmail,
      phone: formattedPhone,
      passwordHash: null,
      role,
    });

    let professional = null;
    if (role === 'professional') {
      const proLng = professionalDetails.longitude !== undefined && professionalDetails.longitude !== null && !isNaN(professionalDetails.longitude)
        ? parseFloat(professionalDetails.longitude)
        : 77.2090;
      const proLat = professionalDetails.latitude !== undefined && professionalDetails.latitude !== null && !isNaN(professionalDetails.latitude)
        ? parseFloat(professionalDetails.latitude)
        : 28.6139;

      professional = await Professional.create({
        userId: user.id,
        bio: professionalDetails.bio || `Hello, I'm ${cleanName}, verified ${professionalDetails.category || 'Specialist'} on SabFix.`,
        experience: professionalDetails.experience || 3,
        price: professionalDetails.price || 350,
        address: professionalDetails.address || 'Delhi NCR',
        longitude: proLng,
        latitude: proLat,
      });

      // Link selected service category if provided
      if (professionalDetails.serviceId || professionalDetails.category) {
        try {
          let sId = professionalDetails.serviceId;
          if (!sId && professionalDetails.category) {
            const sRes = await db.query(
              `SELECT id FROM services WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1 LIMIT 1`,
              [`%${professionalDetails.category.toLowerCase()}%`]
            );
            if (sRes.rows[0]) sId = sRes.rows[0].id;
          }
          if (sId) {
            await db.query(
              `INSERT INTO professional_services (professional_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [professional.id, sId]
            );
          }
        } catch (linkErr) {
          console.error('[AuthService] Error linking professional service:', linkErr);
        }
      }
    }

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
