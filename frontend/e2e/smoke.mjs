#!/usr/bin/env node
/**
 * Smoke test E2E — Sistem Informasi Workshop UNAND
 *
 * Membuka setiap halaman di kelima portal dan memeriksa:
 *  - tidak ada error JavaScript / console error,
 *  - konten utama tampil (bukan layar kosong),
 *  - tidak ada gulir horizontal di layar HP (tabel menjadi kartu),
 *  - alur penting: login via form, kembali ke halaman asal setelah login,
 *    detail & tanda tangan Mitra, tanda tangan Rektor, detail perbaikan Mitra.
 *
 * Prasyarat: backend (npm run dev di /backend) & frontend (npm run dev) berjalan,
 * database sudah di-seed. Memakai Chrome/Edge yang terpasang (tanpa unduh browser).
 *
 *   npm run test:e2e
 *   BASE_URL=http://localhost:5173 API_URL=http://localhost:5000/api/v1 CHROME_PATH="..." npm run test:e2e
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const AXE_PATH = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

/** Audit axe-core (WCAG 2.1 A/AA); kembalikan pelanggaran berdampak critical/serious */
async function axeCheck(page) {
  // Tunggu animasi masuk selesai (teks yang sedang fade-in terbaca berkontras rendah)
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(a => a.effect?.getTiming().iterations !== Infinity)
    .map(a => a.finished.catch(() => {}))));
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
    return result.violations
      .filter(v => ['critical', 'serious'].includes(v.impact))
      .map(v => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`);
  });
}

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const API = process.env.API_URL || 'http://localhost:5000/api/v1';
const PASSWORD = process.env.DEMO_PASSWORD || 'password123';
const HEADLESS = process.env.HEADED ? false : true;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const executablePath = CHROME_CANDIDATES.find(p => fs.existsSync(p));

const ROUTES = {
  peserta: ['/peserta/beranda', '/peserta/cari-workshop', '/peserta/workshop-saya', '/peserta/sertifikat', '/peserta/sertifikat/perbaikan', '/peserta/profil'],
  humas: ['/humas/ringkasan', '/humas/kelola-kegiatan', '/humas/kelola-kegiatan/1', '/humas/kelola-kegiatan/1?tab=presensi', '/humas/kelola-mitra', '/humas/kelola-gedung', '/humas/kelola-pengguna', '/humas/template-sertifikat', '/humas/perbaikan-sertifikat', '/humas/laporan', '/humas/log-audit', '/humas/profil'],
  sekretariat: ['/sekretariat/dashboard', '/sekretariat/kegiatan', '/sekretariat/kegiatan/1', '/sekretariat/presensi', '/sekretariat/sertifikat', '/sekretariat/sertifikat-perbaikan', '/sekretariat/log-audit', '/sekretariat/profil'],
  rektor: ['/rektor/pengajuan', '/rektor/pengajuan/1', '/rektor/riwayat', '/rektor/sertifikat-perbaikan', '/rektor/profil'],
  mitra: ['/mitra/kegiatan-kerja-sama', '/mitra/kegiatan-kerja-sama/1', '/mitra/peserta', '/mitra/template-sertifikat', '/mitra/perbaikan-sertifikat', '/mitra/tanda-tangan', '/mitra/laporan', '/mitra/profil'],
};
// Halaman bertabel yang dicek juga di layar HP
const MOBILE = [['sekretariat', '/sekretariat/sertifikat'], ['humas', '/humas/kelola-kegiatan'], ['mitra', '/mitra/laporan'], ['rektor', '/rektor/riwayat'], ['peserta', '/peserta/sertifikat/perbaikan']];

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

async function apiLogin(role) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${role}@unand.ac.id`, password: PASSWORD }) });
  const body = await res.json();
  if (!body.success) throw new Error(`Login API ${role} gagal: ${body.message}`);
  return body.data;
}
async function apiGet(token, path) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return (await res.json()).data;
}

async function contextFor(browser, role, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  if (role) {
    // Sesi berupa cookie httpOnly (sama seperti setelah login di browser)
    const { token } = await apiLogin(role);
    const host = new URL(API).hostname;
    await ctx.addCookies([{ name: 'wu_session', value: token, domain: host, path: '/', httpOnly: true, sameSite: 'Lax' }]);
    ctx.token = token;
  }
  return ctx;
}

function watch(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_ABORTED/.test(m.text())) errors.push(m.text()); });
  return errors;
}

async function visit(page, errors, path) {
  errors.length = 0;
  await page.goto(BASE + path, { waitUntil: 'load' });
  // tunggu skeleton/lazy chunk selesai
  await page.waitForFunction(() => !document.querySelector('.ui-skeleton'), null, { timeout: 15000 }).catch(() => {});
  const text = await page.evaluate(() => (document.querySelector('main')?.innerText || document.body.innerText || '').trim().length);
  return { text, errors: [...errors] };
}

async function run() {
  if (!executablePath) {
    console.error('Chrome/Edge tidak ditemukan. Set CHROME_PATH ke lokasi browser Chromium.');
    process.exit(2);
  }
  try { await fetch(`${API}/health`).catch(() => fetch(API)); } catch {
    console.error(`Backend tidak dapat dihubungi di ${API}. Jalankan backend terlebih dahulu.`);
    process.exit(2);
  }
  const browser = await chromium.launch({ executablePath, headless: HEADLESS });
  const started = Date.now();

  // ── 1. Login lewat form & kembali ke halaman asal (tautan QR presensi)
  console.log('\nAlur login');
  {
    const ctx = await contextFor(browser, null);
    const page = await ctx.newPage();
    const errors = watch(page);
    const target = '/peserta/workshop-saya?presensi=contoh&kode=ABC123';
    await page.goto(BASE + target, { waitUntil: 'load' });
    // Pengecekan sesi berjalan asinkron, lalu dialihkan ke halaman masuk
    await page.waitForURL(u => u.pathname === '/', { timeout: 10000 }).catch(() => {});
    record('Halaman terlindungi mengarahkan ke login', new URL(page.url()).pathname === '/', page.url());
    await page.fill('input[type="email"]', 'peserta@unand.ac.id');
    await page.fill('input[type="password"]', PASSWORD);
    await Promise.all([page.waitForURL(u => u.pathname.startsWith('/peserta'), { timeout: 15000 }), page.locator('form button[type="submit"]').click()]);
    const after = new URL(page.url());
    record('Setelah login kembali ke halaman asal (termasuk kode QR)', after.pathname === '/peserta/workshop-saya' && after.searchParams.get('kode') === 'ABC123', after.pathname + after.search);
    record('Tanpa error JavaScript saat login', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ── 2. Semua halaman per role
  for (const [role, paths] of Object.entries(ROUTES)) {
    console.log(`\nPortal ${role}`);
    const ctx = await contextFor(browser, role);
    const page = await ctx.newPage();
    const errors = watch(page);
    for (const path of paths) {
      const r = await visit(page, errors, path);
      const ok = r.errors.length === 0 && r.text > 40;
      record(path, ok, r.errors.length ? r.errors.join(' | ').slice(0, 300) : r.text <= 40 ? 'konten kosong' : '');
      // Aksesibilitas (WCAG 2.1 AA): pelanggaran critical/serious = gagal
      const a11y = await axeCheck(page);
      record(`${path} · aksesibilitas`, a11y.length === 0, a11y.join(' | ').slice(0, 300));
    }
    await ctx.close();
  }

  // ── 3. Layar HP: tidak ada gulir horizontal, tabel menjadi kartu
  console.log('\nLayar HP (390px)');
  for (const [role, path] of MOBILE) {
    const ctx = await contextFor(browser, role, { width: 390, height: 844 });
    const page = await ctx.newPage();
    const errors = watch(page);
    await visit(page, errors, path);
    const m = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - window.innerWidth, cards: document.querySelectorAll('table.ui-cardable').length, tables: document.querySelectorAll('main table thead').length }));
    record(`${path} @390px`, m.overflow <= 1 && m.cards === m.tables, `gulir horizontal ${m.overflow}px · tabel kartu ${m.cards}/${m.tables}`);
    await ctx.close();
  }

  // ── 4. Alur tampilan yang dipecah ke komponen terpisah
  console.log('\nAlur detail & tanda tangan');
  {
    const ctx = await contextFor(browser, 'mitra');
    const page = await ctx.newPage();
    const errors = watch(page);
    const subs = await apiGet(ctx.token, '/certificates/submissions');
    const waiting = subs.find(s => s.status === 'menunggu-mitra') || subs[0];
    await visit(page, errors, `/mitra/tanda-tangan/${waiting.id}`);
    const detailOk = await page.getByText('Detail Sertifikat').first().isVisible().catch(() => false);
    record('Mitra: /tanda-tangan/:id membuka detail', detailOk && errors.length === 0, errors.join(' | '));
    const signBtn = page.getByRole('button', { name: /Konfirmasi dan Tanda Tangani/ });
    if (await signBtn.count()) {
      await signBtn.first().click();
      await page.waitForTimeout(400);
      const canvas = await page.locator('canvas').count();
      record('Mitra: tampilan tanda tangan (kanvas) terbuka', canvas > 0 && errors.length === 0, errors.join(' | '));
    } else record('Mitra: tombol tanda tangan tersedia', false, `pengajuan ${waiting.id} tidak menunggu TTD`);

    await visit(page, errors, '/mitra/perbaikan-sertifikat');
    await page.getByRole('button', { name: /Lihat Detail/ }).first().click();
    await page.waitForTimeout(400);
    const perbaikanOk = await page.getByText(/Detail Pengajuan/).first().isVisible().catch(() => false);
    record('Mitra: detail pengajuan perbaikan terbuka', perbaikanOk && errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  {
    const ctx = await contextFor(browser, 'rektor');
    const page = await ctx.newPage();
    const errors = watch(page);
    const subs = await apiGet(ctx.token, '/certificates/submissions');
    const waiting = subs.find(s => s.status === 'menunggu-rektor');
    if (waiting) {
      await visit(page, errors, `/rektor/pengajuan/${waiting.id}`);
      await page.getByRole('button', { name: /Konfirmasi dan Tanda Tangani/ }).first().click();
      await page.waitForTimeout(400);
      const canvas = await page.locator('canvas').count();
      record('Rektor: tampilan tanda tangan (kanvas) terbuka', canvas > 0 && errors.length === 0, errors.join(' | '));
    } else record('Rektor: ada pengajuan menunggu TTE', false, 'seed tidak berisi pengajuan menunggu-rektor');
    await ctx.close();
  }

  // ── 5. Sertifikat resmi: PDF dari server, verifikasi publik, kalender
  console.log('\nSertifikat & kalender');
  {
    const ctx = await contextFor(browser, 'peserta');
    const page = await ctx.newPage();
    const errors = watch(page);
    const certs = await apiGet(ctx.token, '/certificates/my');
    const cert = certs[0];
    if (cert) {
      const pdf = await ctx.request.get(`${API}/certificates/issued/${encodeURIComponent(cert.id)}/pdf`);
      const body = await pdf.body();
      record('PDF sertifikat dibuat server', pdf.ok() && body.slice(0, 4).toString() === '%PDF', `${pdf.status()} · ${body.length} byte`);
      await visit(page, errors, '/peserta/sertifikat');
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
        page.getByRole('button', { name: /Unduh PDF/ }).first().click(),
      ]);
      record('Tombol Unduh PDF mengunduh berkas', Boolean(download) && /\.pdf$/.test(download?.suggestedFilename() || ''), download?.suggestedFilename() || 'tidak ada unduhan');
      // Halaman verifikasi publik (tanpa login)
      const pub = await browser.newContext();
      const pp = await pub.newPage();
      const pubErrors = watch(pp);
      await visit(pp, pubErrors, `/verifikasi/${encodeURIComponent(cert.number)}`);
      record('Verifikasi publik: sertifikat sah', await pp.getByText('Sertifikat SAH').isVisible().catch(() => false) && pubErrors.length === 0, cert.number);
      await visit(pp, pubErrors, '/verifikasi/NOMOR-PALSU-000');
      record('Verifikasi publik: nomor palsu ditolak', await pp.getByText('Sertifikat tidak ditemukan').isVisible().catch(() => false));
      await pub.close();
    } else record('Peserta demo punya sertifikat', false);
    const ics = await ctx.request.get(`${API}/workshops/data-science/calendar.ics`);
    const text = await ics.text();
    record('Berkas kalender (.ics) valid', ics.ok() && text.includes('BEGIN:VEVENT') && text.includes('TZID=Asia/Jakarta'), `${ics.status()}`);
    await ctx.close();
  }

  // ── 6. Keamanan sesi: token tidak pernah tersimpan di browser
  {
    const ctx = await contextFor(browser, null);
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.fill('input[type="email"]', 'humas@unand.ac.id');
    await page.fill('input[type="password"]', PASSWORD);
    await Promise.all([page.waitForURL(u => u.pathname.startsWith('/humas'), { timeout: 15000 }), page.locator('form button[type="submit"]').click()]);
    const stored = await page.evaluate(() => JSON.stringify(localStorage) + document.cookie);
    const cookies = await ctx.cookies();
    const session = cookies.find(c => c.name === 'wu_session');
    record('Sesi memakai cookie httpOnly (token tidak terbaca JavaScript)', Boolean(session?.httpOnly) && !stored.includes(session?.value || '§'), session ? 'httpOnly' : 'cookie tidak ada');
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} lulus dalam ${((Date.now() - started) / 1000).toFixed(1)} dtk`);
  if (failed.length) {
    console.log('\nGagal:');
    failed.forEach(f => console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`));
    process.exit(1);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
