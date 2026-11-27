/** Alur tanda tangan elektronik: PIN, penguncian PIN, Mitra → Rektor → terbit, audit + hash, PDF & verifikasi */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, loginAs, login, query, PIN } = require('./helpers');

const SIGNATURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
let submission;
let mitra;
let rektor;

before(async () => {
  await setup();
  [submission] = await query("SELECT id, workshop_id, perlu_rektor FROM certificate_submissions WHERE status = 'menunggu-mitra' AND perlu_rektor = 1 LIMIT 1");
  assert.ok(submission, 'seed harus memiliki pengajuan yang menunggu TTE mitra');
  mitra = await loginAs('mitra');
  rektor = await loginAs('rektor');
});
after(teardown);

test('PIN salah ditolak dengan sisa percobaan, status tidak berubah', async () => {
  const res = await api('POST', `/certificates/submissions/${submission.id}/sign`, { session: mitra, body: { pin: '000000', signature: SIGNATURE } });
  assert.equal(res.status, 400);
  assert.match(res.body.message, /Sisa 4 percobaan/);
  const [s] = await query('SELECT status FROM certificate_submissions WHERE id = ?', [submission.id]);
  assert.equal(s.status, 'menunggu-mitra');
});

test('Rektor tidak bisa menandatangani sebelum Mitra', async () => {
  const res = await api('POST', `/certificates/submissions/${submission.id}/sign`, { session: rektor, body: { pin: PIN } });
  assert.equal(res.status, 422);
});

test('Mitra menandatangani → menunggu Rektor; tanda tangan tersimpan di disk; audit dengan hash dokumen', async () => {
  const res = await api('POST', `/certificates/submissions/${submission.id}/sign`, { session: mitra, body: { pin: PIN, signature: SIGNATURE } });
  assert.equal(res.status, 200, res.body.message);
  const [s] = await query('SELECT status, mitra_signature FROM certificate_submissions WHERE id = ?', [submission.id]);
  assert.equal(s.status, 'menunggu-rektor');
  assert.match(s.mitra_signature, /^\/uploads\/signatures\//);
  const [log] = await query("SELECT doc_hash, ip FROM audit_logs WHERE action = 'certificate.sign' AND entity_id = ? ORDER BY id DESC LIMIT 1", [submission.id]);
  assert.match(log.doc_hash, /^[0-9a-f]{64}$/);
  assert.ok(log.ip);
});

test('Rektor menandatangani → sertifikat terbit untuk peserta hadir', async () => {
  const res = await api('POST', `/certificates/submissions/${submission.id}/sign`, { session: rektor, body: { pin: PIN, signature: SIGNATURE } });
  assert.equal(res.status, 200, res.body.message);
  const [s] = await query('SELECT status FROM certificate_submissions WHERE id = ?', [submission.id]);
  assert.equal(s.status, 'diterbitkan');
  const [{ n }] = await query('SELECT COUNT(*) AS n FROM certificates WHERE workshop_id = ?', [submission.workshop_id]);
  assert.ok(Number(n) > 0);
  const [issue] = await query("SELECT description FROM audit_logs WHERE action = 'certificate.issue' AND entity_id = ?", [submission.id]);
  assert.ok(issue);
});

test('PDF sertifikat: pemilik boleh, peserta lain ditolak; verifikasi publik sah', async () => {
  const [cert] = await query(
    `SELECT c.code, c.nomor, u.email FROM certificates c JOIN users u ON u.id = c.user_id WHERE c.workshop_id = ? LIMIT 1`, [submission.workshop_id]
  );
  const owner = await login(cert.email);
  const pdf = await api('GET', `/certificates/issued/${encodeURIComponent(cert.code)}/pdf`, { session: owner });
  assert.equal(pdf.status, 200);
  assert.equal(pdf.body.subarray(0, 4).toString(), '%PDF');
  const [other] = await query(
    "SELECT u.email FROM users u JOIN roles r ON r.id = u.role_id WHERE r.code = 'peserta' AND u.email <> ? LIMIT 1", [cert.email]
  );
  const intruder = await login(other.email);
  assert.equal((await api('GET', `/certificates/issued/${encodeURIComponent(cert.code)}/pdf`, { session: intruder })).status, 403);
  const verify = await api('GET', `/certificates/verify/${encodeURIComponent(cert.nomor)}`);
  assert.equal(verify.status, 200);
  assert.equal(verify.body.data.valid, true);
  assert.match(verify.body.data.kodeKeaslian, /^[0-9A-F]{12}$/);
  assert.equal(verify.body.data.penandatangan.length, 2);
  assert.equal((await api('GET', '/certificates/verify/NOMOR-PALSU')).status, 404);
});

test('PIN dikunci setelah 5 kali salah, PIN benar pun ditolak selama terkunci', async () => {
  let res;
  for (let i = 0; i < 5; i++) res = await api('POST', '/auth/me/pin/verify', { session: rektor, body: { pin: '999999' } });
  assert.equal(res.status, 429);
  const blocked = await api('POST', '/auth/me/pin/verify', { session: rektor, body: { pin: PIN } });
  assert.equal(blocked.status, 429);
  const actions = (await query("SELECT action FROM audit_logs WHERE action LIKE 'tte.pin_%'")).map((r) => r.action);
  assert.ok(actions.includes('tte.pin_locked'));
  assert.ok(actions.includes('tte.pin_blocked'));
});
