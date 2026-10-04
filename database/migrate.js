const fs = require('fs');
const path = require('path');
const { pool } = require('../backend/config/db');

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('--- Running WorkConnect Database Migrations ---');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Executing migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        console.log(`✓ Migration completed: ${file}`);
      }
    }
    console.log('--- All migrations completed successfully! ---');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
