/**
 * Kerangka pengujian backend (node:test).
 *
 * - Memakai database TERPISAH (default `sim_workshop_unand_test`) yang dibuat ulang
 *   dari migrasi + seed sebelum setiap berkas uji — database pengembangan tidak tersentuh.
 * - Menjalankan aplikasi Express di port acak dan menyediakan helper HTTP.
 *
 * Variabel lingkungan HARUS diatur sebelum modul aplikasi dimuat.
 */
const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'sim_workshop_unand_test';
process.env.SCHEDULER_ENABLED = 'false';
process.env.RATE_LIMIT_LOGIN = '10000';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'workshop-unand-test-uploads');

const migrate = require('../database/migrate');
const seed = require('../database/seeders/seed');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const ORIGIN = 'http://localhost:5173';
const PASSWORD = 'password123';
const PIN = '123456';

let server;
let base;

/** Siapkan database bersih + server. Panggil di `before()` setiap berkas uji. */
async function setup() {
  const quiet = console.log;
  console.log = () => {};
  try {
    await migrate({ fresh: true, quiet: true });
    await seed();
  } finally {
    console.log = quiet;
  }
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
}

async function teardown() {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}

/** Permintaan HTTP ke API. Mengembalikan { status, body, headers }. */
async function api(method, url, { body, session, origin = ORIGIN, headers = {} } = {}) {
  const res = await fetch(base + url, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...(session ? { Cookie: `wu_session=${session}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json() : Buffer.from(await res.arrayBuffer());
  return { status: res.status, body: data, headers: res.headers };
}

/** Login dan kembalikan nilai cookie sesi */
async function login(email, password = PASSWORD) {
  const res = await api('POST', '/auth/login', { body: { email, password } });
  if (res.status !== 200) throw new Error(`Login ${email} gagal: ${res.body?.message}`);
  const cookie = res.headers.get('set-cookie') || '';
  const m = /wu_session=([^;]+)/.exec(cookie);
  return m[1];
}
const loginAs = (role) => login(`${role}@unand.ac.id`);

const query = async (sql, params = []) => (await pool.query(sql, params))[0];

module.exports = { setup, teardown, api, login, loginAs, query, PASSWORD, PIN, ORIGIN };
