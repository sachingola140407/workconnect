const db = require('../config/db');

class Review {
  /**
   * Create a new review
   */
  static async create({ bookingId, customerId, professionalId, rating, comment = '' }) {
    const query = `
      INSERT INTO reviews (booking_id, customer_id, professional_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (booking_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment
      RETURNING *;
    `;
    const { rows } = await db.query(query, [bookingId, customerId, professionalId, rating, comment]);

    // Recalculate and update professional rating
    const avgQuery = `
      SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS count
      FROM reviews
      WHERE professional_id = $1;
    `;
    const avgRes = await db.query(avgQuery, [professionalId]);
    if (avgRes.rows.length > 0) {
      await db.query(
        `UPDATE professionals SET rating = $1, review_count = $2 WHERE id = $3;`,
        [parseFloat(avgRes.rows[0].avg_rating) || 5.0, parseInt(avgRes.rows[0].count, 10) || 1, professionalId]
      );
    }

    return rows[0];
  }

  /**
   * Get all reviews with customer & pro details (Admin moderation)
   */
  static async getAll({ limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT 
        r.*,
        u_cust.name AS customer_name,
        u_cust.email AS customer_email,
        u_pro.name AS professional_name,
        s.name AS service_name,
        b.status AS booking_status
      FROM reviews r
      JOIN users u_cust ON r.customer_id = u_cust.id
      JOIN professionals pro ON r.professional_id = pro.id
      JOIN users u_pro ON pro.user_id = u_pro.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM reviews;`;
    const [dataRes, countRes] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery),
    ]);
    return {
      reviews: dataRes.rows,
      total: parseInt(countRes.rows[0].total, 10),
    };
  }

  /**
   * Delete / moderate a review
   */
  static async delete(id) {
    const { rows } = await db.query(`DELETE FROM reviews WHERE id = $1 RETURNING *;`, [id]);
    return rows[0] || null;
  }
}

module.exports = Review;
