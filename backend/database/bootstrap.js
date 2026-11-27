/**
 * Dijalankan saat container backend start (lihat Dockerfile):
 *  1. menerapkan migrasi baru (data lama aman),
 *  2. bila SEED_DEMO=true dan database masih kosong, mengisi data demo.
 */
const migrate = require('./migrate');
const seed = require('./seeders/seed');
const mysql = require('mysql2/promise');
const config = require('../src/config/app.config');

async function waitForDb(retries = 30) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mysql.createConnection({ host: config.db.host, port: config.db.port, user: config.db.user, password: config.db.password });
      await conn.end();
      return;
    } catch (err) {
      console.log(`[Bootstrap] Menunggu MySQL (${i}/${retries}): ${err.code || err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('MySQL tidak dapat dihubungi');
}

(async () => {
  await waitForDb();
  await migrate();
  if (process.env.SEED_DEMO === 'true') {
    const conn = await mysql.createConnection({ ...config.db });
    const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM users');
    await conn.end();
    if (Number(n) === 0) {
      console.log('[Bootstrap] Database kosong — mengisi data demo...');
      await seed();
    }
  }
})().catch((err) => {
  console.error('[Bootstrap] Gagal:', err.message);
  process.exit(1);
});
