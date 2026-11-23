/**
 * Menjalankan semua berkas SQL di database/migrations secara berurutan.
 * Membuat database terlebih dahulu bila belum ada.
 *
 *   npm run db:migrate
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config/app.config');

async function migrate() {
  const { host, port, user, password, database } = config.db;
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${database}\``);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`[Migrate] Menjalankan ${file}`);
    await conn.query(fs.readFileSync(path.join(dir, file), 'utf8'));
  }

  await conn.end();
  console.log(`[Migrate] Selesai. Database '${database}' siap.`);
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('[Migrate] Gagal:', err.message);
    process.exit(1);
  });
}

module.exports = migrate;
