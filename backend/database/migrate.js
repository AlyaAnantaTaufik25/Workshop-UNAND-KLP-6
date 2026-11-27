/**
 * Migrasi database BERTAHAP.
 *
 * Setiap berkas di database/migrations (.sql atau .js) dijalankan SEKALI, berurutan
 * menurut nama, lalu dicatat di tabel `schema_migrations`. Menjalankan ulang
 * `npm run db:migrate` hanya menerapkan migrasi baru — data yang ada TIDAK hilang.
 *
 *   npm run db:migrate          # terapkan migrasi yang belum dijalankan
 *   npm run db:migrate:status   # lihat migrasi yang sudah / belum dijalankan
 *   npm run db:fresh            # HAPUS database, buat ulang dari nol, lalu seed (khusus pengembangan)
 *
 * Menambah perubahan skema: buat berkas baru, mis. `005_tambah_kolom_x.sql`.
 * Jangan mengubah berkas migrasi yang sudah pernah di-push.
 *
 * Berkas .js mengekspor `async function up(conn)` (untuk migrasi data).
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config/app.config');

const DIR = path.join(__dirname, 'migrations');
const BASELINE = '001_initial_schema.sql';

const listFiles = () => fs.readdirSync(DIR).filter((f) => /\.(sql|js)$/.test(f)).sort();

async function connect({ fresh = false } = {}) {
  const { host, port, user, password, database } = config.db;
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true, dateStrings: true });
  if (fresh) {
    if (config.app.env === 'production' && !process.env.ALLOW_FRESH) {
      throw new Error('db:fresh diblokir di production (set ALLOW_FRESH=1 bila benar-benar disengaja)');
    }
    console.log(`[Migrate] Menghapus database '${database}'...`);
    await conn.query(`DROP DATABASE IF EXISTS \`${database}\``);
  }
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${database}\``);
  await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(190) PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  return conn;
}

async function applied(conn) {
  const [rows] = await conn.query('SELECT name FROM schema_migrations');
  const set = new Set(rows.map((r) => r.name));
  // Database lama (dibuat sebelum ada schema_migrations): tandai skema awal sudah diterapkan
  if (!set.size) {
    const [[{ n }]] = await conn.query(
      "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'"
    );
    if (n > 0) {
      await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [BASELINE]);
      set.add(BASELINE);
      console.log(`[Migrate] Database lama terdeteksi — ${BASELINE} ditandai sudah diterapkan.`);
    }
  }
  return set;
}

async function migrate({ fresh = false, quiet = false } = {}) {
  const conn = await connect({ fresh });
  try {
    const done = await applied(conn);
    const pending = listFiles().filter((f) => !done.has(f));
    if (!pending.length && !quiet) console.log('[Migrate] Tidak ada migrasi baru. Skema sudah terbaru.');
    for (const file of pending) {
      console.log(`[Migrate] Menjalankan ${file}`);
      const full = path.join(DIR, file);
      if (file.endsWith('.sql')) {
        await conn.query(fs.readFileSync(full, 'utf8'));
      } else {
        const mod = require(full);
        await mod.up(conn);
      }
      await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
    }
    if (pending.length) console.log(`[Migrate] Selesai: ${pending.length} migrasi diterapkan ke '${config.db.database}'.`);
    return pending;
  } finally {
    await conn.end();
  }
}

async function status() {
  const conn = await connect();
  try {
    const done = await applied(conn);
    for (const f of listFiles()) console.log(`${done.has(f) ? '  [x]' : '  [ ]'} ${f}`);
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const run = args.includes('--status') ? status() : migrate({ fresh: args.includes('--fresh') });
  run.catch((err) => {
    console.error('[Migrate] Gagal:', err.message);
    process.exit(1);
  });
}

module.exports = migrate;
module.exports.status = status;
