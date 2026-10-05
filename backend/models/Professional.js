const db = require('../config/db');
const { MAX_SERVICE_RADIUS_KM } = require('../config/constants');

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
      INSERT INTO professionals (user_id, bio, experience, price, address, location, is_verified, is_available, is_online, is_busy)
      VALUES ($1, $2, $3, $4, $5, ${locationSql}, TRUE, TRUE, TRUE, FALSE)
      RETURNING id, user_id, bio, experience, rating, review_count, price, is_available, is_verified, is_online, is_busy, address, created_at;
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
        COALESCE(p.visiting_charge, 99.00) AS visiting_charge,
        p.is_available, p.is_verified,
        COALESCE(p.is_online, TRUE) AS is_online,
        COALESCE(p.is_busy, FALSE) AS is_busy,
        p.location_updated_at,
        p.address,
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
   * Find professional profile by professional ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        p.id, p.user_id, p.bio, p.experience, p.rating, p.review_count, p.price,
        COALESCE(p.visiting_charge, 99.00) AS visiting_charge,
        p.is_available, p.is_verified,
        COALESCE(p.is_online, TRUE) AS is_online,
        COALESCE(p.is_busy, FALSE) AS is_busy,
        p.location_updated_at,
        p.address,
        u.name, u.email, u.phone,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude,
        p.created_at, p.updated_at
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 OR p.user_id = $1;
    `;
    const { rows } = await db.query(query, [id]);
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
   * Toggle online/offline status (Prompt 2 Section 14)
   */
  static async setOnlineStatus(userId, isOnline) {
    const query = `
      UPDATE professionals
      SET is_online = $2, updated_at = NOW()
      WHERE user_id = $1 OR id = $1
      RETURNING id, user_id, is_online, updated_at;
    `;
    const { rows } = await db.query(query, [userId, isOnline]);
    return rows[0] || null;
  }

  /**
   * Set busy status (Prompt 2 Section 14: Available -> Busy upon accept, Busy -> Available upon complete)
   */
  static async setBusyStatus(idOrUserId, isBusy) {
    const query = `
      UPDATE professionals
      SET is_busy = $2, updated_at = NOW()
      WHERE id = $1 OR user_id = $1
      RETURNING id, user_id, is_busy, updated_at;
    `;
    const { rows } = await db.query(query, [idOrUserId, isBusy]);
    return rows[0] || null;
  }

  /**
   * Update professional profile details
   */
  static async updateProfile(userId, { bio, experience, price, address, longitude = null, latitude = null }) {
    let locationClause = '';
    const values = [userId, bio, experience, price, address];
    if (longitude !== null && latitude !== null && !isNaN(longitude) && !isNaN(latitude)) {
      locationClause = `, location = ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography, location_updated_at = NOW()`;
      values.push(parseFloat(longitude), parseFloat(latitude));
    }

    const query = `
      UPDATE professionals
      SET
        bio = COALESCE($2, bio),
        experience = COALESCE($3, experience),
        price = COALESCE($4, price),
        address = COALESCE($5, address)
        ${locationClause}
      WHERE user_id = $1
      RETURNING id, user_id, bio, experience, price, address, is_available, is_verified, is_online, is_busy, ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude, updated_at;
    `;
    const { rows } = await db.query(query, values);
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
        location_updated_at = NOW(),
        address = COALESCE($4, address)
      WHERE user_id = $1 OR id = $1
      RETURNING id, user_id, address, ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude, location_updated_at, updated_at;
    `;
    const { rows } = await db.query(query, [userId, longitude, latitude, address]);
    return rows[0] || null;
  }

  /**
   * Search and rank professionals using PostGIS spatial matching, service filtering, and ranking
   * Strictly enforces MAX_SERVICE_RADIUS_KM = 10 unless expand=true is explicitly requested
   */
  static async searchNearby({
    service,
    serviceId,
    search,
    isAvailable,
    latitude = null,
    longitude = null,
    radiusKm = null,
    expand = false,
    sortBy = 'best_match',
  } = {}) {
    const values = [];
    let paramIndex = 1;
    // Prompt 2 Section 3 & 14: verified, available, online, not busy, and user is active
    const whereClauses = [
      'u.is_active = TRUE',
      'p.is_available = TRUE',
      'COALESCE(p.is_online, TRUE) = TRUE',
      'COALESCE(p.is_busy, FALSE) = FALSE',
      'p.location IS NOT NULL'
    ];

    // Location calculation expressions
    let distanceSelectSql = 'NULL AS distance_km';

    if (longitude !== null && latitude !== null && !isNaN(longitude) && !isNaN(latitude)) {
      const lngParam = paramIndex++;
      const latParam = paramIndex++;
      values.push(parseFloat(longitude), parseFloat(latitude));

      // ST_Distance returns meters on geography type, divide by 1000 for km
      distanceSelectSql = `
        ROUND(
          (ST_Distance(p.location, ST_SetSRID(ST_MakePoint($${lngParam}, $${latParam}), 4326)::geography) / 1000.0)::numeric,
          1
        ) AS distance_km
      `;

      // Prompt 2 Section 1 & 15: Strictly limit to 10 KM max unless explicit expand=true
      const maxRadius = expand === true || expand === 'true'
        ? (parseFloat(radiusKm) || 50)
        : MAX_SERVICE_RADIUS_KM;

      const radiusMetersParam = paramIndex++;
      values.push(maxRadius * 1000);
      whereClauses.push(
        `ST_DWithin(p.location, ST_SetSRID(ST_MakePoint($${lngParam}, $${latParam}), 4326)::geography, $${radiusMetersParam})`
      );
    }

    if (isAvailable === false || isAvailable === 'false') {
      // If caller specifically wanted non-available, but default is already filtered
    }

    if (serviceId) {
      const svcParam = paramIndex++;
      values.push(serviceId);
      whereClauses.push(
        `p.id IN (SELECT professional_id FROM professional_services WHERE service_id = $${svcParam})`
      );
    } else if (service && service !== 'all') {
      const svcParam = paramIndex++;
      values.push(`%${service.trim()}%`);
      whereClauses.push(`
        p.id IN (
          SELECT ps.professional_id 
          FROM professional_services ps
          JOIN services s ON ps.service_id = s.id
          WHERE s.name ILIKE $${svcParam} OR s.category ILIKE $${svcParam}
        )
      `);
    }

    if (search) {
      const searchParam = paramIndex++;
      values.push(`%${search.trim()}%`);
      whereClauses.push(`(u.name ILIKE $${searchParam} OR p.bio ILIKE $${searchParam} OR p.address ILIKE $${searchParam})`);
    }

    // Prompt 2 Section 3: Sort results: 1. Distance, 2. Availability, 3. Rating, 4. Experience
    let orderClause = 'ORDER BY distance_km ASC NULLS LAST, p.is_available DESC, p.rating DESC, p.experience DESC';
    if (sortBy === 'rating') {
      orderClause = 'ORDER BY p.rating DESC, distance_km ASC NULLS LAST';
    } else if (sortBy === 'experience') {
      orderClause = 'ORDER BY p.experience DESC, distance_km ASC NULLS LAST';
    } else if (sortBy === 'price_asc') {
      orderClause = 'ORDER BY p.price ASC, distance_km ASC NULLS LAST';
    } else if (sortBy === 'price_desc') {
      orderClause = 'ORDER BY p.price DESC';
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        p.id,
        p.user_id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        p.bio,
        p.experience,
        p.rating,
        p.review_count,
        p.price,
        p.visiting_charge,
        p.is_available,
        p.is_verified,
        COALESCE(p.is_online, TRUE) AS is_online,
        COALESCE(p.is_busy, FALSE) AS is_busy,
        p.location_updated_at,
        p.address,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude,
        ${distanceSelectSql},
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'category', s.category,
              'icon', s.icon
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS services
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN professional_services ps ON p.id = ps.professional_id
      LEFT JOIN services s ON ps.service_id = s.id
      ${whereSql}
      GROUP BY p.id, u.id, p.location
      ${orderClause};
    `;

    const { rows } = await db.query(query, values);

    // Format & assign Best Match badge to #1 highest-ranked professional
    return rows.map((pro, index) => ({
      ...pro,
      price: parseFloat(pro.price) || 0,
      visiting_charge: parseFloat(pro.visiting_charge) || 99,
      rating: parseFloat(pro.rating) || 0,
      experience: parseInt(pro.experience, 10) || 0,
      distance_km: pro.distance_km !== null ? parseFloat(pro.distance_km) : null,
      isBestMatch: index === 0 && rows.length > 0 && pro.is_available,
    }));
  }

  /**
   * Get single professional profile with full services & user info
   */
  static async getById(id) {
    const query = `
      SELECT 
        p.id,
        p.user_id,
        u.name,
        u.email,
        u.phone,
        u.avatar_url,
        p.bio,
        p.experience,
        p.rating,
        p.review_count,
        p.price,
        p.visiting_charge,
        p.is_available,
        p.is_verified,
        p.address,
        ST_X(p.location::geometry) AS longitude,
        ST_Y(p.location::geometry) AS latitude,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'category', s.category,
              'icon', s.icon,
              'description', s.description
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS services
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN professional_services ps ON p.id = ps.professional_id
      LEFT JOIN services s ON ps.service_id = s.id
      WHERE p.id = $1 OR p.user_id = $1
      GROUP BY p.id, u.id;
    `;
    const { rows } = await db.query(query, [id]);
    if (!rows[0]) return null;

    const pro = rows[0];
    return {
      ...pro,
      price: parseFloat(pro.price) || 0,
      visiting_charge: parseFloat(pro.visiting_charge) || 99,
      rating: parseFloat(pro.rating) || 0,
      experience: parseInt(pro.experience, 10) || 0,
    };
  }

  /**
   * Get comprehensive activity & acceptance metrics for all professionals (Admin Audit)
   */
  static async getActivityStats({ search } = {}) {
    let whereSql = '';
    const values = [];

    if (search) {
      values.push(`%${search.trim()}%`);
      whereSql = `WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR p.address ILIKE $1`;
    }

    const query = `
      SELECT 
        p.id,
        p.user_id,
        u.name,
        u.email,
        u.phone,
        p.experience,
        p.rating,
        p.review_count,
        p.price,
        p.visiting_charge,
        p.is_available,
        p.is_verified,
        p.address,
        COUNT(b.id) AS total_requests,
        COUNT(b.id) FILTER (WHERE b.status IN ('accepted', 'on_the_way', 'arrived', 'working', 'completed')) AS accepted_requests,
        COUNT(b.id) FILTER (WHERE b.status = 'completed') AS completed_requests,
        COUNT(b.id) FILTER (WHERE b.status = 'rejected') AS rejected_requests,
        COUNT(b.id) FILTER (WHERE b.status = 'pending') AS pending_requests,
        COALESCE(SUM(b.price) FILTER (WHERE b.status = 'completed'), 0) AS total_earnings,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('name', s.name, 'category', s.category)
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS services
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN professional_services ps ON p.id = ps.professional_id
      LEFT JOIN services s ON ps.service_id = s.id
      LEFT JOIN bookings b ON p.id = b.professional_id
      ${whereSql}
      GROUP BY p.id, u.id
      ORDER BY total_requests DESC, completed_requests DESC, p.rating DESC;
    `;

    const { rows } = await db.query(query, values);

    return rows.map((r) => {
      const total = parseInt(r.total_requests, 10) || 0;
      const accepted = parseInt(r.accepted_requests, 10) || 0;
      const completed = parseInt(r.completed_requests, 10) || 0;
      const rejected = parseInt(r.rejected_requests, 10) || 0;
      const pending = parseInt(r.pending_requests, 10) || 0;

      const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
      const completionRate = accepted > 0 ? Math.round((completed / accepted) * 100) : 0;

      return {
        ...r,
        price: parseFloat(r.price) || 0,
        visiting_charge: parseFloat(r.visiting_charge) || 99,
        rating: parseFloat(r.rating) || 0,
        total_requests: total,
        accepted_requests: accepted,
        completed_requests: completed,
        rejected_requests: rejected,
        pending_requests: pending,
        acceptance_rate: acceptanceRate,
        completion_rate: completionRate,
        total_earnings: parseFloat(r.total_earnings) || 0,
      };
    });
  }

  /**
   * Get detailed job history of a specific professional (Admin Audit)
   */
  static async getJobHistory(professionalId) {
    const query = `
      SELECT 
        b.id,
        b.status,
        b.price,
        b.visiting_charge,
        b.customer_address,
        b.notes,
        b.created_at,
        b.updated_at,
        s.name AS service_name,
        u.name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.professional_id = $1
      ORDER BY b.created_at DESC;
    `;
    const { rows } = await db.query(query, [professionalId]);
    return rows;
  }
}

module.exports = Professional;
