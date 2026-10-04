const db = require('../config/db');

class User {
  /**
   * Create a new user in the database
   */
  static async create({ name, email, phone, passwordHash, role = 'customer' }) {
    const query = `
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, avatar_url, is_active, created_at, updated_at;
    `;
    const values = [name.trim(), email.toLowerCase().trim(), phone ? phone.trim() : null, passwordHash, role];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Find a user by email (includes password_hash for authentication)
   */
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, phone, password_hash, role, avatar_url, is_active, created_at, updated_at
      FROM users
      WHERE email = $1;
    `;
    const { rows } = await db.query(query, [email.toLowerCase().trim()]);
    return rows[0] || null;
  }

  /**
   * Find a user by ID (excludes password_hash)
   */
  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, role, avatar_url, is_active, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Find user with professional profile (if professional)
   */
  static async findWithProfile(id) {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.avatar_url, u.is_active, u.created_at, u.updated_at,
        p.id AS professional_id, p.bio, p.experience, p.rating, p.review_count, p.price,
        p.is_available, p.is_verified, p.address,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude
      FROM users u
      LEFT JOIN professionals p ON u.id = p.user_id
      WHERE u.id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Get all users with optional filtering and pagination
   */
  static async getAll({ role, search, limit = 20, offset = 0 } = {}) {
    let whereClauses = [];
    let values = [];
    let paramIndex = 1;

    if (role) {
      whereClauses.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (search) {
      whereClauses.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT id, name, email, phone, role, avatar_url, is_active, created_at, updated_at
      FROM users
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    values.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereSql};
    `;

    const [itemsResult, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, values.slice(0, paramIndex - 3)),
    ]);

    return {
      users: itemsResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Update user details
   */
  static async update(id, { name, phone, avatarUrl }) {
    const query = `
      UPDATE users
      SET 
        name = COALESCE($2, name),
        phone = COALESCE($3, phone),
        avatar_url = COALESCE($4, avatar_url)
      WHERE id = $1
      RETURNING id, name, email, phone, role, avatar_url, is_active, created_at, updated_at;
    `;
    const { rows } = await db.query(query, [id, name, phone, avatarUrl]);
    return rows[0] || null;
  }

  /**
   * Set user active status (block / unblock)
   */
  static async setStatus(id, isActive) {
    const query = `
      UPDATE users
      SET is_active = $2
      WHERE id = $1
      RETURNING id, name, email, phone, role, is_active, updated_at;
    `;
    const { rows } = await db.query(query, [id, isActive]);
    return rows[0] || null;
  }

  /**
   * Get aggregated counts by role for admin analytics
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'customer') AS total_customers,
        COUNT(*) FILTER (WHERE role = 'professional') AS total_professionals,
        COUNT(*) FILTER (WHERE role = 'admin') AS total_admins
      FROM users;
    `;
    const { rows } = await db.query(query);
    return rows[0];
  }
}

module.exports = User;
