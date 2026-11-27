/** Autentikasi & keamanan: sesi cookie httpOnly, penguncian login, CSRF, audit */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, login, query, PASSWORD } = require('./helpers');

before(setup);
after(teardown);

test('login berhasil memasang cookie sesi httpOnly & SameSite=Lax', async () => {
  const res = await api('POST', '/auth/login', { body: { email: 'humas@unand.ac.id', password: PASSWORD } });
  assert.equal(res.status, 200);
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, /wu_session=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.equal(res.body.data.user.role, 'humas');
});

test('cookie sesi dipakai untuk endpoint terlindungi; tanpa sesi ditolak 401', async () => {
  const session = await login('humas@unand.ac.id');
  assert.equal((await api('GET', '/auth/me', { session })).status, 200);
  assert.equal((await api('GET', '/auth/me')).status, 401);
});

test('/auth/session tidak memberi 401 saat belum masuk', async () => {
  const res = await api('GET', '/auth/session');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.user, null);
});

test('akun dikunci 15 menit setelah 5 kali kata sandi salah — kata sandi benar pun ditolak', async () => {
  const email = 'sekretariat@unand.ac.id';
  const statuses = [];
  for (let i = 0; i < 5; i++) statuses.push((await api('POST', '/auth/login', { body: { email, password: 'salah-sekali' } })).status);
  assert.deepEqual(statuses, [401, 401, 401, 401, 429]);
  const locked = await api('POST', '/auth/login', { body: { email, password: PASSWORD } });
  assert.equal(locked.status, 429);
  assert.match(locked.body.message, /dikunci sementara/);
  const [row] = await query("SELECT login_locked_until > NOW() AS locked FROM users WHERE email = ?", [email]);
  assert.equal(Number(row.locked), 1);
});

test('peringatan sisa percobaan muncul sebelum penguncian', async () => {
  const email = 'rektor@unand.ac.id';
  let last;
  for (let i = 0; i < 3; i++) last = await api('POST', '/auth/login', { body: { email, password: 'keliru' } });
  assert.match(last.body.message, /Sisa 2 percobaan/);
  // Login benar mengatur ulang hitungan kegagalan
  await login(email);
  const [row] = await query('SELECT login_failed_count AS n FROM users WHERE email = ?', [email]);
  assert.equal(Number(row.n), 0);
});

test('permintaan pengubah data dari situs lain ditolak (CSRF)', async () => {
  const session = await login('humas@unand.ac.id');
  const res = await api('PUT', '/auth/me', { session, origin: 'https://situs-jahat.example', body: { nama: 'Diretas' } });
  assert.equal(res.status, 403);
  const [u] = await query("SELECT nama FROM users WHERE email = 'humas@unand.ac.id'");
  assert.notEqual(u.nama, 'Diretas');
});

test('login, kegagalan, dan penguncian tercatat di audit log', async () => {
  const rows = await query("SELECT action FROM audit_logs WHERE action LIKE 'auth.%'");
  const actions = new Set(rows.map((r) => r.action));
  for (const a of ['auth.login', 'auth.login_failed', 'auth.login_locked', 'auth.login_blocked']) assert.ok(actions.has(a), `audit ${a}`);
  const humas = await login('humas@unand.ac.id');
  const res = await api('GET', '/audit-logs?action=auth&limit=5&page=1', { session: humas });
  assert.equal(res.status, 200);
  assert.ok(res.body.data.meta.total >= 4);
  assert.ok(res.body.data.items[0].ip);
  // Peserta tidak boleh membaca audit log
  const peserta = await login('peserta@unand.ac.id');
  assert.equal((await api('GET', '/audit-logs', { session: peserta })).status, 403);
});

test('logout menghapus cookie sesi', async () => {
  const session = await login('mitra@unand.ac.id');
  const res = await api('POST', '/auth/logout', { session });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('set-cookie'), /wu_session=;/);
});
