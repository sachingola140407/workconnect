const db = require('../config/db');
const { emitToBooking } = require('../services/socketService');

class Booking {
  /**
   * Create a new service booking request
   */
  static async create({
    customerId,
    professionalId,
    serviceId,
    price,
    visitingCharge = 99.0,
    customerAddress,
    customerLocation = null,
    notes = '',
    scheduledAt = null,
  }) {
    let locationSql = 'NULL';
    let values = [
      customerId,
      professionalId,
      serviceId,
      price,
      visitingCharge,
      customerAddress,
      notes,
      scheduledAt || new Date(),
    ];

    if (customerLocation && customerLocation.longitude && customerLocation.latitude) {
      locationSql = `ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography`;
      values.push(customerLocation.longitude, customerLocation.latitude);
    } else {
      // Default to New Delhi Connaught Place coordinates if not provided
      locationSql = `ST_SetSRID(ST_MakePoint(77.2167, 28.6315), 4326)::geography`;
    }

    const query = `
      INSERT INTO bookings (
        customer_id,
        professional_id,
        service_id,
        price,
        visiting_charge,
        customer_address,
        notes,
        scheduled_at,
        customer_location,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${locationSql}, 'pending')
      RETURNING id, customer_id, professional_id, service_id, price, visiting_charge, customer_address, notes, scheduled_at, status, created_at;
    `;

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Get bookings made by a customer
   */
  static async getByCustomerId(customerId) {
    const query = `
      SELECT 
        b.id,
        b.status,
        b.price,
        COALESCE(b.final_service_amount, b.price) AS final_service_amount,
        COALESCE(b.visiting_charge, p.visiting_charge, 99.00) AS visiting_charge,
        COALESCE(b.platform_fee, 50.00) AS platform_fee,
        b.total_amount,
        b.payment_status,
        b.payment_method,
        b.invoice_id,
        b.customer_address,
        b.notes,
        b.scheduled_at,
        b.started_at,
        b.arrived_at,
        b.work_started_at,
        b.work_completed_at,
        b.completed_at,
        b.created_at,
        b.updated_at,
        ST_X(b.customer_location::geometry) AS customer_lng,
        ST_Y(b.customer_location::geometry) AS customer_lat,
        ST_X(p.location::geometry) AS professional_lng,
        ST_Y(p.location::geometry) AS professional_lat,
        ROUND(
          (ST_Distance(p.location, b.customer_location) / 1000.0)::numeric,
          1
        ) AS distance_km,
        s.id AS service_id,
        s.name AS service_name,
        s.category AS service_category,
        s.icon AS service_icon,
        p.id AS professional_id,
        p.rating AS professional_rating,
        p.experience AS professional_experience,
        u.name AS professional_name,
        u.phone AS professional_phone,
        u.email AS professional_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN professionals p ON b.professional_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC;
    `;
    const { rows } = await db.query(query, [customerId]);
    return rows.map((r) => ({
      ...r,
      price: parseFloat(r.price) || 0,
      final_service_amount: r.final_service_amount ? parseFloat(r.final_service_amount) : (parseFloat(r.price) || 0),
      visiting_charge: parseFloat(r.visiting_charge) || 99,
      platform_fee: parseFloat(r.platform_fee) || 50,
      total_amount: r.total_amount ? parseFloat(r.total_amount) : null,
      professional_rating: parseFloat(r.professional_rating) || 0,
      distance_km: r.distance_km !== null ? parseFloat(r.distance_km) : 1.2,
    }));
  }

  /**
   * Get bookings received by a professional
   */
  static async getByProfessionalId(professionalId) {
    const query = `
      SELECT 
        b.id,
        b.status,
        b.price,
        COALESCE(b.final_service_amount, b.price) AS final_service_amount,
        COALESCE(b.visiting_charge, 99.00) AS visiting_charge,
        COALESCE(b.platform_fee, 50.00) AS platform_fee,
        b.total_amount,
        b.payment_status,
        b.payment_method,
        b.invoice_id,
        b.customer_address,
        b.notes,
        b.scheduled_at,
        b.started_at,
        b.arrived_at,
        b.work_started_at,
        b.work_completed_at,
        b.completed_at,
        b.created_at,
        b.updated_at,
        ST_X(b.customer_location::geometry) AS customer_lng,
        ST_Y(b.customer_location::geometry) AS customer_lat,
        s.id AS service_id,
        s.name AS service_name,
        s.category AS service_category,
        u.name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.professional_id = $1 OR b.professional_id IN (SELECT id FROM professionals WHERE user_id = $1)
      ORDER BY b.created_at DESC;
    `;
    const { rows } = await db.query(query, [professionalId]);
    return rows.map((r) => ({
      ...r,
      price: parseFloat(r.price) || 0,
      final_service_amount: r.final_service_amount ? parseFloat(r.final_service_amount) : (parseFloat(r.price) || 0),
      visiting_charge: parseFloat(r.visiting_charge) || 99,
      platform_fee: parseFloat(r.platform_fee) || 50,
      total_amount: r.total_amount ? parseFloat(r.total_amount) : null,
    }));
  }

  /**
   * Update booking status with lifecycle timestamps and real-time broadcasts
   */
  static async updateStatus(id, status) {
    let timestampField = '';
    if (status === 'on_the_way') {
      timestampField = ', started_at = COALESCE(started_at, NOW())';
    } else if (status === 'arrived') {
      timestampField = ', arrived_at = COALESCE(arrived_at, NOW())';
    } else if (status === 'working') {
      timestampField = ', work_started_at = COALESCE(work_started_at, NOW())';
    } else if (status === 'work_completed') {
      timestampField = ', work_completed_at = COALESCE(work_completed_at, NOW())';
    } else if (status === 'completed' || status === 'payment_completed') {
      timestampField = ', completed_at = COALESCE(completed_at, NOW())';
    }

    const query = `
      UPDATE bookings
      SET status = $2, updated_at = NOW() ${timestampField}
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id, status]);
    const updated = rows[0] || null;

    if (updated) {
      // Real-time broadcast
      emitToBooking(id, 'booking:status-change', {
        bookingId: id,
        status,
        updatedAt: updated.updated_at,
      });

      // Status specific events
      if (status === 'accepted') emitToBooking(id, 'booking:accepted', { bookingId: id });
      if (status === 'on_the_way') emitToBooking(id, 'booking:on-the-way', { bookingId: id });
      if (status === 'arrived') emitToBooking(id, 'booking:arrived', { bookingId: id });
      if (status === 'working') emitToBooking(id, 'booking:working', { bookingId: id });
      if (status === 'work_completed') emitToBooking(id, 'booking:work-completed', { bookingId: id });
    }

    return updated;
  }

  /**
   * Get detailed tracking data for real-time live map view
   */
  static async getTrackingDetails(id) {
    const query = `
      SELECT 
        b.id,
        b.status,
        b.price,
        COALESCE(b.final_service_amount, b.price) AS final_service_amount,
        COALESCE(b.visiting_charge, p.visiting_charge, 99.00) AS visiting_charge,
        COALESCE(b.platform_fee, 50.00) AS platform_fee,
        b.total_amount,
        b.payment_status,
        b.payment_method,
        b.invoice_id,
        b.customer_address,
        b.notes,
        b.scheduled_at,
        b.started_at,
        b.arrived_at,
        b.work_started_at,
        b.work_completed_at,
        b.completed_at,
        b.created_at,
        b.updated_at,
        ST_X(b.customer_location::geometry) AS customer_lng,
        ST_Y(b.customer_location::geometry) AS customer_lat,
        ST_X(p.location::geometry) AS professional_lng,
        ST_Y(p.location::geometry) AS professional_lat,
        ROUND(
          (ST_Distance(p.location, b.customer_location) / 1000.0)::numeric,
          2
        ) AS distance_km,
        s.id AS service_id,
        s.name AS service_name,
        s.category AS service_category,
        s.icon AS service_icon,
        p.id AS professional_id,
        p.rating AS professional_rating,
        p.review_count AS professional_review_count,
        p.experience AS professional_experience,
        p.bio AS professional_bio,
        p.is_verified AS professional_verified,
        p.address AS professional_address,
        u.id AS customer_user_id,
        u.name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        pu.name AS professional_name,
        pu.phone AS professional_phone,
        pu.email AS professional_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN professionals p ON b.professional_id = p.id
      JOIN users u ON b.customer_id = u.id
      JOIN users pu ON p.user_id = pu.id
      WHERE b.id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    if (!rows[0]) return null;

    const r = rows[0];
    const distanceKm = r.distance_km !== null ? parseFloat(r.distance_km) : 1.2;

    // Calculate dynamic ETA based on distance and status
    let etaMinutes = Math.max(3, Math.round(distanceKm * 4 + 2));
    if (r.status === 'arrived') etaMinutes = 0;
    else if (r.status === 'working') etaMinutes = 0;
    else if (r.status === 'work_completed' || r.status === 'payment_pending' || r.status === 'payment_completed' || r.status === 'completed') {
      etaMinutes = 0;
    }

    return {
      ...r,
      price: parseFloat(r.price) || 0,
      final_service_amount: r.final_service_amount ? parseFloat(r.final_service_amount) : (parseFloat(r.price) || 0),
      visiting_charge: parseFloat(r.visiting_charge) || 99,
      platform_fee: parseFloat(r.platform_fee) || 50,
      total_amount: r.total_amount ? parseFloat(r.total_amount) : null,
      professional_rating: parseFloat(r.professional_rating) || 0,
      distance_km: distanceKm,
      eta_minutes: etaMinutes,
      customer_lat: r.customer_lat !== null ? parseFloat(r.customer_lat) : 28.6315,
      customer_lng: r.customer_lng !== null ? parseFloat(r.customer_lng) : 77.2167,
      professional_lat: r.professional_lat !== null ? parseFloat(r.professional_lat) : 28.6139,
      professional_lng: r.professional_lng !== null ? parseFloat(r.professional_lng) : 77.2090,
    };
  }

  /**
   * Update professional location for real-time tracking simulation
   */
  static async updateTrackingLocation(bookingId, { latitude, longitude }) {
    const bookingRes = await db.query('SELECT professional_id FROM bookings WHERE id = $1', [bookingId]);
    if (!bookingRes.rows[0]) return null;

    const proId = bookingRes.rows[0].professional_id;
    const query = `
      UPDATE professionals
      SET location = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
      WHERE id = $1
      RETURNING id, ST_X(location::geometry) as professional_lng, ST_Y(location::geometry) as professional_lat;
    `;
    const { rows } = await db.query(query, [proId, longitude, latitude]);
    return rows[0] || null;
  }
}

module.exports = Booking;
