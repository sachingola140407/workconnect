const db = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Automatically ensure the designated admin user (sachin123@gmail.com / sachin123)
 * exists in PostgreSQL database and has full admin privileges.
 */
async function ensureAdminUser() {
  try {
    const adminEmail = 'sachin123@gmail.com';
    const adminPass = 'sachin123';
    const hash = await bcrypt.hash(adminPass, 10);

    const query = `
      INSERT INTO users (id, name, email, phone, password_hash, role, is_active)
      VALUES (
        'fdf2940c-3420-468d-86e7-ec515c375eef',
        'Sachin Admin',
        $1,
        '+91 9876500000',
        $2,
        'admin',
        true
      )
      ON CONFLICT (email)
      DO UPDATE SET 
        password_hash = $2,
        role = 'admin',
        is_active = true,
        name = 'Sachin Admin'
      RETURNING id, name, email, role;
    `;

    const { rows } = await db.query(query, [adminEmail, hash]);
    console.log(`[AdminInit] Verified admin user: ${rows[0]?.email} (${rows[0]?.role})`);
  } catch (err) {
    console.error('[AdminInit] Error ensuring admin user exists:', err.message);
  }
}

module.exports = { ensureAdminUser };
