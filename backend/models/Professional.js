const db = require('../config/db');

class Professional {
  /**
   * Create an initial professional profile
   */
  static async create({ userId, bio = '', experience = 0, price = 0, address = '', longitude = null, latitude = null }) {
    let locationSql = 'NULL';
    let values = [userId, bio, experience, price, address];

    if (longitude !== null && latitude !== null) {
      locationSql = `ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography`;
      values.push(longitude, latitude);
    }

    const query = `
      INSERT INTO professionals (user_id, bio, experience, price, address, location)
      VALUES ($1, $2, $3, $4, $5, ${locationSql})
      RETURNING id, user_id, bio, experience, rating, review_count, price, is_available, is_verified, address, created_at;
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Find professional profile by user ID
   */
  static async findByUserId(userId) {
    const query = `
      SELECT 
        p.id, p.user_id, p.bio, p.experience, p.rating, p.review_count, p.price,
        p.is_available, p.is_verified, p.address,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude,
        p.created_at, p.updated_at
      FROM professionals p
      WHERE p.user_id = $1;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows[0] || null;
  }

  /**
   * Verify or unverify a professional (Admin action)
   */
  static async setVerification(id, isVerified) {
    const query = `
      UPDATE professionals
      SET is_verified = $2
      WHERE id = $1 OR user_id = $1
      RETURNING id, user_id, is_verified, updated_at;
    `;
    const { rows } = await db.query(query, [id, isVerified]);
    return rows[0] || null;
  }

  /**
   * Toggle availability status
   */
  static async setAvailability(userId, isAvailable) {
    const query = `
      UPDATE professionals
      SET is_available = $2
      WHERE user_id = $1
      RETURNING id, user_id, is_available, updated_at;
    `;
    const { rows } = await db.query(query, [userId, isAvailable]);
    return rows[0] || null;
  }

  /**
   * Update professional profile details
   */
  static async updateProfile(userId, { bio, experience, price, address }) {
    const query = `
      UPDATE professionals
      SET
        bio = COALESCE($2, bio),
        experience = COALESCE($3, experience),
        price = COALESCE($4, price),
        address = COALESCE($5, address)
      WHERE user_id = $1
      RETURNING id, user_id, bio, experience, price, address, is_available, is_verified, updated_at;
    `;
    const { rows } = await db.query(query, [userId, bio, experience, price, address]);
    return rows[0] || null;
  }

  /**
   * Update professional location coordinates (PostGIS)
   */
  static async updateLocation(userId, { longitude, latitude, address }) {
    const query = `
      UPDATE professionals
      SET 
        location = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
        address = COALESCE($4, address)
      WHERE user_id = $1
      RETURNING id, user_id, address, ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude, updated_at;
    `;
    const { rows } = await db.query(query, [userId, longitude, latitude, address]);
    return rows[0] || null;
  }
}

module.exports = Professional;
