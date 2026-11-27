/**
 * Penyimpanan berkas di disk (bukan base64 di database).
 *
 * Berkas disimpan di <UPLOAD_DIR>/<folder>/<tahun>/<bulan>/<acak>.<ext> dan database hanya
 * menyimpan path-nya ('/uploads/...'). Disajikan statis oleh Express di /uploads.
 * Nilai lama berupa data URL (sebelum migrasi) tetap dilayani apa adanya.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' };

/** Pisahkan data URL → { mime, buffer } */
function parseDataUrl(dataUrl) {
  const m = /^data:([\w/+.-]+);base64,(.*)$/s.exec(String(dataUrl || ''));
  if (!m) return null;
  return { mime: m[1].toLowerCase(), buffer: Buffer.from(m[2], 'base64') };
}

/**
 * Simpan data URL ke disk. Mengembalikan path publik '/uploads/...'.
 * Nilai yang sudah berupa '/uploads/...' dikembalikan apa adanya (tidak diunggah ulang).
 */
function saveDataUrl(dataUrl, folder) {
  if (!dataUrl) return null;
  if (String(dataUrl).startsWith('/uploads/')) return dataUrl;
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error('Format berkas tidak dikenali');
  const ext = EXT[parsed.mime] || 'bin';
  const now = new Date();
  const rel = path.posix.join(folder, String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'), `${crypto.randomBytes(12).toString('hex')}.${ext}`);
  const full = path.join(UPLOAD_ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, parsed.buffer);
  return `/uploads/${rel}`;
}

/** Lokasi fisik untuk path '/uploads/...' (atau null) — dicegah keluar dari UPLOAD_ROOT */
function resolvePath(stored) {
  if (!stored || !String(stored).startsWith('/uploads/')) return null;
  const full = path.resolve(UPLOAD_ROOT, String(stored).slice('/uploads/'.length));
  return full.startsWith(UPLOAD_ROOT) ? full : null;
}

/** Hapus berkas lama (diam bila tidak ada) */
function removeFile(stored) {
  const full = resolvePath(stored);
  if (full) fs.rm(full, { force: true }, () => {});
}

/** Baca isi berkas sebagai Buffer (untuk PDF/hash); mendukung data URL lama */
function readBuffer(stored) {
  if (!stored) return null;
  if (String(stored).startsWith('data:')) return parseDataUrl(stored)?.buffer || null;
  const full = resolvePath(stored);
  return full && fs.existsSync(full) ? fs.readFileSync(full) : null;
}

/** URL lengkap untuk frontend */
function publicUrl(stored) {
  if (!stored) return null;
  if (String(stored).startsWith('/uploads/')) return `${PUBLIC_URL}${stored}`;
  return stored; // data URL lama atau URL eksternal
}

const byteSize = (dataUrl) => (parseDataUrl(dataUrl)?.buffer.length || 0);

module.exports = { UPLOAD_ROOT, PUBLIC_URL, saveDataUrl, removeFile, readBuffer, publicUrl, parseDataUrl, byteSize };
