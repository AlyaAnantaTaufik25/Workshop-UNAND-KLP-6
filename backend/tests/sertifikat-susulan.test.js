/** Sertifikat susulan: peserta yang divalidasi hadir SETELAH sertifikat kegiatan terbit */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, loginAs, query } = require('./helpers');

let humas;
let workshop;

before(async () => {
  await setup();
  humas = await loginAs('humas');
  const [w] = await query(
    `SELECT w.id, w.slug FROM workshops w JOIN certificate_submissions s ON s.workshop_id = w.id
     WHERE s.status = 'diterbitkan' AND w.sumber = 'UNAND' LIMIT 1`
  );
  assert.ok(w, 'seed harus memiliki kegiatan UNAND yang sertifikatnya sudah terbit');
  workshop = w;
});
after(teardown);

async function latePending(email) {
  const reg = await api('POST', '/auth/register', { origin: null, body: { nama: `Peserta ${email}`, email, password: 'rahasia123' } });
  const userId = reg.body.data.user.id;
  const r = await query("INSERT INTO registrations (workshop_id, user_id, status) VALUES (?, ?, 'selesai')", [workshop.id, userId]);
  const a = await query("INSERT INTO attendances (registration_id, tanggal, status, method) VALUES (?, CURDATE(), 'pending', 'upload')", [r.insertId]);
  return { userId, attendanceId: a.insertId };
}

test('verifikasi hadir setelah sertifikat terbit → sertifikat susulan diterbitkan', async () => {
  const before = (await query('SELECT COUNT(*) n FROM certificates WHERE workshop_id = ?', [workshop.id]))[0].n;
  const late = await latePending('susulan1@example.com');
  const res = await api('PATCH', `/attendance/${late.attendanceId}/verify`, { session: humas, body: { status: 'hadir' } });
  assert.equal(res.status, 200, res.body.message);
  const [cert] = await query('SELECT nomor FROM certificates WHERE workshop_id = ? AND user_id = ?', [workshop.id, late.userId]);
  assert.ok(cert, 'peserta susulan harus mendapat sertifikat');
  const after = (await query('SELECT COUNT(*) n FROM certificates WHERE workshop_id = ?', [workshop.id]))[0].n;
  assert.equal(Number(after), Number(before) + 1);
});

test('beberapa penerbitan susulan tidak bentrok nomor dan tidak menggandakan sertifikat', async () => {
  const a = await latePending('susulan2@example.com');
  const b = await latePending('susulan3@example.com');
  for (const x of [a, b]) {
    const res = await api('PATCH', `/attendance/${x.attendanceId}/verify`, { session: humas, body: { status: 'hadir' } });
    assert.equal(res.status, 200, res.body.message);
  }
  // Verifikasi ulang tidak membuat sertifikat ganda
  const again = await api('PATCH', `/attendance/${a.attendanceId}/verify`, { session: humas, body: { status: 'hadir' } });
  assert.equal(again.status, 200);
  const rows = await query('SELECT user_id, nomor FROM certificates WHERE workshop_id = ? AND user_id IN (?)', [workshop.id, [a.userId, b.userId]]);
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].nomor, rows[1].nomor);
});

test('bukti ditolak tidak menerbitkan sertifikat', async () => {
  const x = await latePending('susulan4@example.com');
  const res = await api('PATCH', `/attendance/${x.attendanceId}/verify`, { session: humas, body: { status: 'ditolak', reason: 'Nama tidak terlihat' } });
  assert.equal(res.status, 200);
  const rows = await query('SELECT id FROM certificates WHERE workshop_id = ? AND user_id = ?', [workshop.id, x.userId]);
  assert.equal(rows.length, 0);
});
