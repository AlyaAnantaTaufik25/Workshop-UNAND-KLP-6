/** Presensi offline: kode QR dari panitia + validasi radius lokasi (geofence) */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, loginAs, query } = require('./helpers');

const LOKASI = { lat: -0.9145, lng: 100.4602 }; // titik gedung kegiatan
let workshop;
let peserta;
let humas;

before(async () => {
  await setup();
  // Kegiatan offline yang diikuti akun peserta demo, dengan presensi dibuka & geofence 100 m
  const [w] = await query(
    `SELECT w.id, w.slug FROM workshops w JOIN registrations r ON r.workshop_id = w.id
     JOIN users u ON u.id = r.user_id
     WHERE u.email = 'peserta@unand.ac.id' AND r.status = 'terdaftar' AND w.mode = 'offline' AND w.status <> 'dibatalkan' AND w.location_id IS NOT NULL
     LIMIT 1`
  );
  assert.ok(w, 'seed harus memiliki kegiatan offline yang diikuti peserta demo');
  workshop = w;
  await query("UPDATE workshops SET status_presensi = 'dibuka' WHERE id = ?", [w.id]);
  await query('UPDATE locations l JOIN workshops w ON w.location_id = l.id SET l.latitude = ?, l.longitude = ?, l.radius = 100 WHERE w.id = ?', [LOKASI.lat, LOKASI.lng, w.id]);
  await query(`DELETE a FROM attendances a JOIN registrations r ON r.id = a.registration_id JOIN users u ON u.id = r.user_id
               WHERE r.workshop_id = ? AND u.email = 'peserta@unand.ac.id'`, [w.id]);
  peserta = await loginAs('peserta');
  humas = await loginAs('humas');
});
after(teardown);

let kode;

test('Humas membuat kode presensi berbatas waktu', async () => {
  const res = await api('POST', '/attendance/generate-qr', { session: humas, body: { workshopId: workshop.id, minutes: 15 } });
  assert.equal(res.status, 201);
  kode = res.body.data.token;
  assert.match(kode, /^[0-9A-F]{6}$/);
});

test('peserta biasa tidak boleh membuat kode presensi', async () => {
  const res = await api('POST', '/attendance/generate-qr', { session: peserta, body: { workshopId: workshop.id } });
  assert.equal(res.status, 403);
});

test('kode salah ditolak', async () => {
  const res = await api('POST', '/attendance/check-in', { session: peserta, body: { workshopId: workshop.slug, code: 'ZZZZZZ', latitude: LOKASI.lat, longitude: LOKASI.lng } });
  assert.ok(res.status >= 400);
  assert.match(res.body.message, /tidak valid|kedaluwarsa/);
});

test('di luar radius ditolak dengan jarak yang jelas', async () => {
  // ±1,1 km dari lokasi kegiatan
  const res = await api('POST', '/attendance/check-in', { session: peserta, body: { workshopId: workshop.slug, code: kode, latitude: LOKASI.lat + 0.01, longitude: LOKASI.lng } });
  assert.ok(res.status >= 400);
  assert.match(res.body.message, /maksimal 100 m/);
});

test('kode benar + di dalam radius → hadir', async () => {
  const res = await api('POST', '/attendance/check-in', { session: peserta, body: { workshopId: workshop.slug, code: kode, latitude: LOKASI.lat + 0.0002, longitude: LOKASI.lng } });
  assert.equal(res.status, 200, res.body.message);
  const rows = await query(`SELECT a.status, a.method FROM attendances a JOIN registrations r ON r.id = a.registration_id
                            JOIN users u ON u.id = r.user_id WHERE r.workshop_id = ? AND u.email = 'peserta@unand.ac.id'`, [workshop.id]);
  assert.equal(rows[0].status, 'hadir');
  assert.equal(rows[0].method, 'qr-location');
});

test('presensi kedua untuk sesi yang sama ditolak', async () => {
  const res = await api('POST', '/attendance/check-in', { session: peserta, body: { workshopId: workshop.slug, code: kode, latitude: LOKASI.lat, longitude: LOKASI.lng } });
  assert.ok(res.status >= 400);
  assert.match(res.body.message, /sudah tercatat/);
});

test('bukti presensi online disimpan sebagai berkas di disk, bukan base64 di database', async () => {
  const [w] = await query(
    `SELECT w.id, w.slug FROM workshops w JOIN registrations r ON r.workshop_id = w.id JOIN users u ON u.id = r.user_id
     WHERE u.email = 'peserta@unand.ac.id' AND r.status = 'terdaftar' AND w.mode = 'online' AND w.status <> 'dibatalkan' LIMIT 1`
  );
  if (!w) return; // seed tanpa kegiatan online yang diikuti peserta demo
  await query("UPDATE workshops SET status_presensi = 'dibuka' WHERE id = ?", [w.id]);
  await query(`DELETE a FROM attendances a JOIN registrations r ON r.id = a.registration_id JOIN users u ON u.id = r.user_id
               WHERE r.workshop_id = ? AND u.email = 'peserta@unand.ac.id'`, [w.id]);
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const res = await api('POST', '/attendance/upload', { session: peserta, body: { workshopId: w.slug, fileName: 'bukti.png', fileData: png } });
  assert.equal(res.status, 200, res.body.message);
  const [row] = await query(`SELECT a.file_data FROM attendances a JOIN registrations r ON r.id = a.registration_id
                             JOIN users u ON u.id = r.user_id WHERE r.workshop_id = ? AND u.email = 'peserta@unand.ac.id'`, [w.id]);
  assert.match(row.file_data, /^\/uploads\/presensi\//);
});
