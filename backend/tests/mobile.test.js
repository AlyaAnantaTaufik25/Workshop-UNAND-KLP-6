/**
 * Kontrak API untuk aplikasi mobile peserta (Flutter).
 *
 * Klien mobile berbeda dari browser: tidak memakai cookie dan tidak mengirim header Origin,
 * melainkan menyimpan token dari respons login lalu mengirim `Authorization: Bearer <token>`.
 * Berkas ini memastikan seluruh alur peserta berjalan dengan cara tersebut.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, query, PASSWORD } = require('./helpers');

const PNG_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/** Permintaan gaya mobile: tanpa Origin, tanpa cookie, token Bearer bila ada */
const mobile = (method, url, { token, body } = {}) =>
  api(method, url, { body, origin: null, headers: token ? { Authorization: `Bearer ${token}` } : {} });

let token;
let workshop;

before(setup);
after(teardown);

test('registrasi peserta dari mobile mengembalikan token Bearer yang bisa dipakai', async () => {
  const res = await mobile('POST', '/auth/register', {
    body: { nama: 'Peserta Mobile', email: 'mobile.peserta@example.com', password: 'rahasia123', telepon: '081234567890', jenis: 'Umum' },
  });
  assert.equal(res.status, 201, res.body.message);
  assert.equal(res.body.data.user.role, 'peserta');
  assert.ok(res.body.data.token);
  token = res.body.data.token;

  const me = await mobile('GET', '/auth/me', { token });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.email, 'mobile.peserta@example.com');
  assert.equal(me.body.data.telepon, '081234567890');
});

test('login mobile: token dikembalikan di body; role non-peserta terlihat agar bisa ditolak aplikasi', async () => {
  const ok = await mobile('POST', '/auth/login', { body: { email: 'peserta@unand.ac.id', password: PASSWORD } });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.token);
  assert.equal(ok.body.data.user.role, 'peserta');

  const humas = await mobile('POST', '/auth/login', { body: { email: 'humas@unand.ac.id', password: PASSWORD } });
  assert.equal(humas.status, 200);
  assert.equal(humas.body.data.user.role, 'humas');

  const wrong = await mobile('POST', '/auth/login', { body: { email: 'peserta@unand.ac.id', password: 'salah-sekali' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.success, false);
});

test('token tidak valid ditolak 401 (aplikasi menghapus sesi)', async () => {
  const res = await mobile('GET', '/auth/me', { token: 'bukan-token' });
  assert.equal(res.status, 401);
});

test('peserta memperbarui profil dari mobile (PUT tanpa Origin tidak terkena CSRF)', async () => {
  const res = await mobile('PUT', '/auth/me', { token, body: { nama: 'Peserta Mobile Baru', telepon: '089876543210' } });
  assert.equal(res.status, 200, res.body.message);
  assert.equal(res.body.data.nama, 'Peserta Mobile Baru');
});

test('daftar kegiatan menyertakan tanggal sesi presensi dan status pendaftaran saya', async () => {
  const res = await mobile('GET', '/workshops', { token });
  assert.equal(res.status, 200);
  assert.ok(res.body.data.length > 0);
  for (const w of res.body.data) {
    assert.ok(w.slug);
    assert.match(w.attendanceDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(w.attendanceDate >= w.tanggalMulai && w.attendanceDate <= (w.tanggalSelesai || w.tanggalMulai));
    assert.ok('myRegistration' in w);
  }
  workshop = res.body.data.find((w) => w.registrationState === 'open' && !w.completed && !w.cancelled && w.remaining > 0);
  assert.ok(workshop, 'seed harus memiliki kegiatan yang pendaftarannya dibuka');
});

test('mendaftar, membatalkan, lalu mendaftar ulang kegiatan', async () => {
  const reg = await mobile('POST', '/registrations', { token, body: { workshopId: workshop.slug } });
  assert.equal(reg.status, 201, reg.body.message);
  assert.equal(reg.body.data.myRegistration.status, 'registered');
  assert.deepEqual(reg.body.data.myRegistration.attendanceDays, []);

  const dup = await mobile('POST', '/registrations', { token, body: { workshopId: workshop.slug } });
  assert.equal(dup.status, 409);

  const regId = reg.body.data.myRegistration.registrationId;
  const cancel = await mobile('PATCH', `/registrations/${regId}/cancel`, { token });
  assert.equal(cancel.status, 200, cancel.body.message);
  assert.equal(cancel.body.data.myRegistration.status, 'cancelled');

  const again = await mobile('POST', '/registrations', { token, body: { workshopId: workshop.slug } });
  assert.equal(again.status, 201, again.body.message);
  assert.equal(again.body.data.myRegistration.status, 'registered');

  const my = await mobile('GET', '/registrations/my', { token });
  assert.equal(my.status, 200);
  assert.ok(my.body.data.some((r) => r.workshopId === workshop.slug && r.status === 'registered'));
});

test('presensi online: unggah screenshot tercatat per hari pada attendanceDays', async () => {
  await query("UPDATE workshops SET mode = 'online', status_presensi = 'dibuka' WHERE slug = ?", [workshop.slug]);
  // Kegiatan online tidak boleh check-in langsung (melewati verifikasi panitia)
  const bypass = await mobile('POST', '/attendance/check-in', { token, body: { workshopId: workshop.slug } });
  assert.equal(bypass.status, 422);
  assert.equal(bypass.body.errors[0].state, 'use-upload');
  const res = await mobile('POST', '/attendance/upload', { token, body: { workshopId: workshop.slug, fileName: 'zoom.png', fileData: PNG_1PX } });
  assert.equal(res.status, 200, res.body.message);
  const mine = res.body.data.myRegistration;
  assert.equal(mine.attendanceDays.length, 1);
  assert.equal(mine.attendanceDays[0].status, 'pending');
  assert.equal(mine.attendanceDays[0].date, res.body.data.attendanceDate);
  assert.equal(mine.attendanceDays[0].fileName, 'zoom.png');
  assert.match(mine.attendanceDays[0].fileUrl, /\/uploads\//);

  const twice = await mobile('POST', '/attendance/upload', { token, body: { workshopId: workshop.slug, fileName: 'zoom.png', fileData: PNG_1PX } });
  assert.equal(twice.status, 422);
  assert.equal(twice.body.errors[0].state, 'pending');
});

test('presensi offline tanpa kode saat panitia memakai kode → ditolak dengan state invalid-code', async () => {
  await query("UPDATE workshops SET mode = 'offline' WHERE slug = ?", [workshop.slug]);
  await query(
    `DELETE a FROM attendances a JOIN registrations r ON r.id = a.registration_id JOIN users u ON u.id = r.user_id
     WHERE u.email = 'mobile.peserta@example.com'`
  );
  const [w] = await query('SELECT id FROM workshops WHERE slug = ?', [workshop.slug]);
  await query('INSERT INTO attendance_tokens (workshop_id, token, expires_at) VALUES (?, ?, NOW() + INTERVAL 10 MINUTE)', [w.id, 'ABC123']);
  const res = await mobile('POST', '/attendance/check-in', { token, body: { workshopId: workshop.slug } });
  assert.equal(res.status, 422);
  assert.equal(res.body.errors[0].state, 'invalid-code');
});

test('notifikasi dapat dibaca dan ditandai dibaca dari mobile', async () => {
  const list = await mobile('GET', '/notifications', { token });
  assert.equal(list.status, 200);
  assert.ok(list.body.data.some((n) => n.belumDibaca));
  const read = await mobile('PATCH', '/notifications/read', { token, body: {} });
  assert.equal(read.status, 200);
  const after = await mobile('GET', '/notifications', { token });
  assert.ok(after.body.data.every((n) => !n.belumDibaca));
});

test('sertifikat: daftar milik saya, unduh PDF dengan Bearer, verifikasi publik', async () => {
  const login = await mobile('POST', '/auth/login', { body: { email: 'peserta@unand.ac.id', password: PASSWORD } });
  const demo = login.body.data.token;
  const list = await mobile('GET', '/certificates/my', { token: demo });
  assert.equal(list.status, 200);
  assert.ok(list.body.data.length > 0, 'peserta demo harus memiliki sertifikat');
  const cert = list.body.data[0];

  const pdf = await mobile('GET', `/certificates/issued/${encodeURIComponent(cert.id)}/pdf`, { token: demo });
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get('content-type'), /application\/pdf/);
  assert.equal(pdf.body.subarray(0, 4).toString(), '%PDF');

  const other = await mobile('GET', `/certificates/issued/${encodeURIComponent(cert.id)}/pdf`, { token });
  assert.equal(other.status, 403);

  const verify = await mobile('GET', `/certificates/verify/${encodeURIComponent(cert.number)}`);
  assert.equal(verify.status, 200);
  assert.equal(verify.body.data.valid, true);
});
