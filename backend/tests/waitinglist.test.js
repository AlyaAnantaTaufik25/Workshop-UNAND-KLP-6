/** Kuota & waiting list: promosi berurutan, nomor antrean dirapikan, peserta diberi tahu */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setup, teardown, api, loginAs, query } = require('./helpers');

let humas;
let slug;
const peserta = {};

const bearer = (name) => ({ Authorization: `Bearer ${peserta[name]}` });
const call = (method, url, name, body) => api(method, url, { origin: null, headers: bearer(name), body });
const mine = async (name) => (await call('GET', `/workshops/${slug}`, name)).body.data.myRegistration;

before(async () => {
  await setup();
  humas = await loginAs('humas');
  const created = await api('POST', '/workshops', {
    session: humas,
    body: {
      nama: 'Uji Waiting List', jenis: 'Workshop', mode: 'online', tanggalMulai: '2030-01-10', tanggalSelesai: '2030-01-10',
      kuotaJenis: 'Terbatas', kuota: 1, waitingListEnabled: true, status: 'publik', statusPendaftaran: 'dibuka',
    },
  });
  assert.equal(created.status, 201, created.body.message);
  slug = created.body.data.slug;
  for (const name of ['ani', 'budi', 'citra']) {
    const res = await api('POST', '/auth/register', { origin: null, body: { nama: name, email: `${name}@example.com`, password: 'rahasia123' } });
    assert.equal(res.status, 201, res.body.message);
    peserta[name] = res.body.data.token;
  }
});
after(teardown);

test('kuota 1: pendaftar pertama terdaftar, berikutnya masuk antrean 1 dan 2', async () => {
  assert.equal((await call('POST', '/registrations', 'ani', { workshopId: slug })).status, 201);
  assert.equal((await call('POST', '/registrations', 'budi', { workshopId: slug })).status, 201);
  assert.equal((await call('POST', '/registrations', 'citra', { workshopId: slug })).status, 201);
  assert.equal((await mine('ani')).status, 'registered');
  assert.deepEqual([(await mine('budi')).status, (await mine('budi')).queue], ['waiting', 1]);
  assert.deepEqual([(await mine('citra')).status, (await mine('citra')).queue], ['waiting', 2]);
});

test('pembatalan menaikkan antrean pertama, merapikan nomor antrean, dan memberi tahu peserta', async () => {
  const ani = await mine('ani');
  const res = await call('PATCH', `/registrations/${ani.registrationId}/cancel`, 'ani');
  assert.equal(res.status, 200, res.body.message);
  assert.equal((await mine('budi')).status, 'registered');
  const citra = await mine('citra');
  assert.deepEqual([citra.status, citra.queue], ['waiting', 1]);
  const notif = (await call('GET', '/notifications', 'budi')).body.data;
  assert.ok(notif.some((n) => n.judul.startsWith('Kursi tersedia')), 'budi harus diberi tahu');
});

test('pembatalan ganda ditolak (bukan 500)', async () => {
  const ani = await mine('ani');
  const res = await call('PATCH', `/registrations/${ani.registrationId}/cancel`, 'ani');
  assert.equal(res.status, 422);
});

test('kuota dinaikkan humas → waiting list otomatis terdaftar', async () => {
  const res = await api('PUT', `/workshops/${slug}`, { session: humas, body: { kuotaJenis: 'Terbatas', kuota: 3 } });
  assert.equal(res.status, 200, res.body.message);
  assert.equal((await mine('citra')).status, 'registered');
  const notif = (await call('GET', '/notifications', 'citra')).body.data;
  assert.ok(notif.some((n) => n.judul.startsWith('Kursi tersedia')));
  const [{ n }] = await query("SELECT COUNT(*) n FROM registrations r JOIN workshops w ON w.id = r.workshop_id WHERE w.slug = ? AND r.status = 'waiting'", [slug]);
  assert.equal(Number(n), 0);
});

test('pendaftaran ganda bersamaan dari peserta yang sama → satu berhasil, lainnya 409', async () => {
  const res = await api('POST', '/auth/register', { origin: null, body: { nama: 'dodi', email: 'dodi@example.com', password: 'rahasia123' } });
  peserta.dodi = res.body.data.token;
  const results = await Promise.all([1, 2, 3].map(() => call('POST', '/registrations', 'dodi', { workshopId: slug })));
  const codes = results.map((r) => r.status).sort();
  assert.equal(codes.filter((c) => c === 201).length, 1, JSON.stringify(codes));
  assert.ok(codes.every((c) => c === 201 || c === 409), JSON.stringify(codes));
});

test('id notifikasi tidak valid ditolak 400, bukan galat server', async () => {
  for (const id of [[1, 2], { id: 1 }, 'abc', -3]) {
    const res = await call('PATCH', '/notifications/read', 'budi', { id });
    assert.equal(res.status, 400, JSON.stringify(id));
  }
  const res = await call('PATCH', '/certificates/corrections/read', 'budi', { id: [1, 2] });
  assert.equal(res.status, 400);
});
