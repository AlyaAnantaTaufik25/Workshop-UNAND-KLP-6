/** Alur perbaikan sertifikat: pengajuan peserta → proses penerbit → dokumen pengganti → persetujuan & TTE */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, loginAs, query, PIN } = require('./helpers');

let peserta;
let cert;
let correctionId;
let correctionDbId;

before(async () => {
  await setup();
  peserta = await loginAs('peserta');
  // Sertifikat mitra milik peserta demo yang belum punya perbaikan aktif
  const mine = (await api('GET', '/certificates/my', { session: peserta })).body.data;
  const corrections = (await api('GET', '/certificates/corrections', { session: peserta })).body.data;
  const busy = new Set(corrections.filter((c) => ['menunggu', 'diproses'].includes(c.status)).map((c) => c.certificateId));
  cert = mine.find((c) => c.issuerType === 'mitra' && !busy.has(c.id));
  assert.ok(cert, 'seed harus memiliki sertifikat mitra milik peserta demo');
});
after(teardown);

test('validasi: alasan terlalu pendek ditolak', async () => {
  const res = await api('POST', '/certificates/corrections', { session: peserta, body: { certificateId: cert.id, reason: 'pendek', agreed: true, changes: [{ field: 'recipient', newValue: 'Nama Baru' }] } });
  assert.equal(res.status, 400);
});

test('peserta mengajukan perbaikan nama; lampiran disimpan di disk', async () => {
  const res = await api('POST', '/certificates/corrections', {
    session: peserta,
    body: {
      certificateId: cert.id, agreed: true,
      reason: 'Nama saya salah eja pada sertifikat, mohon diperbaiki sesuai KTP.',
      changes: [{ field: 'recipient', newValue: `${cert.recipient} Putri` }],
      attachment: { name: 'ktp.png', type: 'image/png', size: 68, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
    },
  });
  assert.equal(res.status, 201, res.body.message);
  correctionId = res.body.data.id;
  correctionDbId = res.body.data.dbId;
  const [row] = await query('SELECT attachment FROM certificate_corrections WHERE id = ?', [correctionDbId]);
  assert.match(JSON.parse(row.attachment).url, /^\/uploads\/perbaikan\//);
});

test('pengajuan ganda untuk sertifikat yang sama ditolak', async () => {
  const res = await api('POST', '/certificates/corrections', { session: peserta, body: { certificateId: cert.id, agreed: true, reason: 'Pengajuan kedua yang seharusnya ditolak sistem.', changes: [{ field: 'recipient', newValue: 'Lain Lagi' }] } });
  assert.equal(res.status, 409);
});

test('Humas tidak berwenang memproses perbaikan sertifikat mitra', async () => {
  const humas = await loginAs('humas');
  const res = await api('PATCH', `/certificates/corrections/${correctionId}/process`, { session: humas, body: { action: 'proses' } });
  assert.ok([403, 404].includes(res.status));
});

test('Mitra memproses lalu menyelesaikan → dokumen pengganti terbit & peserta diberi tahu', async () => {
  const mitra = await loginAs('mitra');
  assert.equal((await api('PATCH', `/certificates/corrections/${correctionId}/process`, { session: mitra, body: { action: 'proses' } })).status, 200);
  const done = await api('PATCH', `/certificates/corrections/${correctionId}/process`, { session: mitra, body: { action: 'selesai', note: 'Nama diperbaiki sesuai KTP.' } });
  assert.equal(done.status, 200, done.body.message);
  const [c] = await query('SELECT status, replacement_number, tte_status FROM certificate_corrections WHERE id = ?', [correctionDbId]);
  assert.equal(c.status, 'selesai');
  assert.ok(c.replacement_number);
  const notif = await api('GET', '/notifications', { session: peserta });
  assert.ok(notif.body.data.some((n) => /Perbaikan Sertifikat Selesai/.test(n.judul)));
  // Email masuk antrean untuk peserta
  const [{ n }] = await query("SELECT COUNT(*) AS n FROM email_outbox WHERE to_email = 'peserta@unand.ac.id' AND subject LIKE '%Perbaikan Sertifikat Selesai%'");
  assert.ok(Number(n) >= 1);
  if (c.tte_status === 'sedang-diproses') {
    // Mitra menyetujui, Rektor menandatangani ulang
    assert.equal((await api('POST', `/certificates/replacements/${correctionDbId}/approve`, { session: mitra })).status, 200);
    assert.equal((await api('POST', `/certificates/replacements/${correctionDbId}/approve`, { session: mitra })).status, 422);
    const rektor = await loginAs('rektor');
    const sign = await api('POST', `/certificates/replacements/${correctionDbId}/sign`, { session: rektor, body: { pin: PIN } });
    assert.equal(sign.status, 200, sign.body.message);
    const [log] = await query("SELECT doc_hash FROM audit_logs WHERE action = 'replacement.sign' AND entity_id = ?", [correctionDbId]);
    assert.match(log.doc_hash, /^[0-9a-f]{64}$/);
  }
});

test('pendaftaran workshop mengirim notifikasi konfirmasi', async () => {
  const [w] = await query(
    `SELECT w.id FROM workshops w WHERE w.status_pendaftaran IN ('dibuka', 'segera-ditutup') AND w.status NOT IN ('dibatalkan', 'selesai', 'draft')
     AND w.id NOT IN (SELECT r.workshop_id FROM registrations r JOIN users u ON u.id = r.user_id WHERE u.email = 'peserta@unand.ac.id' AND r.status <> 'dibatalkan')
     AND (w.kuota IS NULL OR w.waiting_list = 1 OR w.kuota > (SELECT COUNT(*) FROM registrations r2 WHERE r2.workshop_id = w.id AND r2.status = 'terdaftar'))
     LIMIT 1`
  );
  if (!w) return;
  const res = await api('POST', '/registrations', { session: peserta, body: { workshopId: w.id } });
  assert.equal(res.status, 200, res.body.message);
  const notif = await api('GET', '/notifications', { session: peserta });
  assert.ok(notif.body.data.some((n) => /Pendaftaran dikonfirmasi|waiting list/i.test(n.judul)));
});
