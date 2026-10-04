const db = require('../config/db');

class Service {
  /**
   * Get all active services with counts of available professionals
   */
  static async getAll() {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.category,
        s.description,
        s.icon,
        COUNT(DISTINCT p.id) FILTER (WHERE p.is_available = true) AS available_pros,
        COUNT(DISTINCT p.id) AS total_pros
      FROM services s
      LEFT JOIN professional_services ps ON s.id = ps.service_id
      LEFT JOIN professionals p ON ps.professional_id = p.id
      GROUP BY s.id, s.name, s.category, s.description, s.icon
      ORDER BY s.name ASC;
    `;
    const { rows } = await db.query(query);
    return rows.map((r) => ({
      ...r,
      available_pros: parseInt(r.available_pros, 10),
      total_pros: parseInt(r.total_pros, 10),
    }));
  }

  /**
   * Find service by ID
   */
  static async findById(id) {
    const query = `SELECT * FROM services WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Find service by Name (case-insensitive)
   */
  static async findByName(name) {
    const query = `SELECT * FROM services WHERE name ILIKE $1 OR category ILIKE $1 LIMIT 1;`;
    const { rows } = await db.query(query, [`%${name.trim()}%`]);
    return rows[0] || null;
  }
}

module.exports = Service;
