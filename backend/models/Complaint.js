const db = require('../config/db');

class Complaint {
  /**
   * Create a new customer/professional complaint
   */
  static async create({ bookingId, userId, description }) {
    const query = `
      INSERT INTO complaints (booking_id, user_id, description, status)
      VALUES ($1, $2, $3, 'open')
      RETURNING *;
    `;
    const { rows } = await db.query(query, [bookingId, userId, description]);
    return rows[0];
  }

  /**
   * Get all complaints (Admin)
   */
  static async getAll({ status, limit = 50, offset = 0 } = {}) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (status && status !== 'all') {
      whereClauses.push(`c.status = $${idx++}`);
      values.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        c.*,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role,
        b.status AS booking_status,
        b.price AS booking_amount,
        s.name AS service_name,
        u_pro.name AS professional_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN bookings b ON c.booking_id = b.id
      LEFT JOIN professionals pro ON b.professional_id = pro.id
      LEFT JOIN users u_pro ON pro.user_id = u_pro.id
      LEFT JOIN services s ON b.service_id = s.id
      ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    const countQuery = `SELECT COUNT(*) AS total FROM complaints c ${whereSql};`;

    const [dataRes, countRes] = await Promise.all([
      db.query(query, [...values, limit, offset]),
      db.query(countQuery, values),
    ]);

    return {
      complaints: dataRes.rows,
      total: parseInt(countRes.rows[0].total, 10),
    };
  }

  /**
   * Update complaint status and admin notes
   */
  static async updateStatus(id, { status, adminNotes = '' }) {
    const query = `
      UPDATE complaints
      SET status = $2, admin_notes = COALESCE($3, admin_notes), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id, status, adminNotes]);
    return rows[0] || null;
  }
}

module.exports = Complaint;
