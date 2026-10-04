const db = require('../config/db');

class Booking {
  /**
   * Create a new service booking request
   */
  static async create({
    customerId,
    professionalId,
    serviceId,
    price,
    customerAddress,
    customerLocation = null,
    notes = '',
    scheduledAt = null,
  }) {
    let locationSql = 'NULL';
    let values = [customerId, professionalId, serviceId, price, customerAddress, notes, scheduledAt || new Date()];

    if (customerLocation && customerLocation.longitude && customerLocation.latitude) {
      locationSql = `ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography`;
      values.push(customerLocation.longitude, customerLocation.latitude);
    }

    const query = `
      INSERT INTO bookings (
        customer_id,
        professional_id,
        service_id,
        price,
        customer_address,
        notes,
        scheduled_at,
        customer_location,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, ${locationSql}, 'pending')
      RETURNING id, customer_id, professional_id, service_id, price, customer_address, notes, scheduled_at, status, created_at;
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
        b.customer_address,
        b.notes,
        b.scheduled_at,
        b.created_at,
        b.updated_at,
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
    return rows;
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
        b.customer_address,
        b.notes,
        b.scheduled_at,
        b.created_at,
        b.updated_at,
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
    return rows;
  }

  /**
   * Update booking status (accepted, rejected, on_the_way, arrived, working, completed, cancelled)
   */
  static async updateStatus(id, status) {
    const query = `
      UPDATE bookings
      SET status = $2
      WHERE id = $1
      RETURNING id, customer_id, professional_id, service_id, status, updated_at;
    `;
    const { rows } = await db.query(query, [id, status]);
    return rows[0] || null;
  }
}

module.exports = Booking;
