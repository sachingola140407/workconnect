const fs = require('fs');
const path = require('path');
const { pool } = require('../backend/config/db');

async function getClientWithRetry(maxRetries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.log(`[Database] Waiting for connection (attempt ${attempt}/${maxRetries}): ${err.message}. Retrying in ${delayMs / 1000}s...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

async function runMigrations() {
  const client = await getClientWithRetry();
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
