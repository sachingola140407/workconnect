const fs = require('fs');
const path = require('path');
const { pool } = require('../backend/config/db');

async function runSeeds() {
  const client = await pool.connect();
  try {
    console.log('--- Seeding WorkConnect Initial Database ---');
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Executing seed file: ${file}...`);
        const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
        await client.query(sql);
        console.log(`✓ Seed completed: ${file}`);
      }
    }
    console.log('--- Initial data seeded successfully! ---');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };
