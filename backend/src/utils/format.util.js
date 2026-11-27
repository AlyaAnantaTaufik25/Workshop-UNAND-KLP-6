/**
 * Helper format tanggal/waktu berbahasa Indonesia (zona WIB).
 */
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Ubah Date/string DATE MySQL menjadi 'YYYY-MM-DD' tanpa pergeseran zona waktu. */
function toISODate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** '2026-05-18' -> '18 Mei 2026' */
function formatTanggal(value, short = false) {
  const iso = toISODate(value);
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${(short ? BULAN_PENDEK : BULAN)[m - 1]} ${y}`;
}

/** Rentang tanggal: '18 Mei 2026' atau '18 Mei 2026 – 20 Mei 2026' */
function formatRentang(mulai, selesai) {
  const a = toISODate(mulai);
  const b = toISODate(selesai);
  if (!b || a === b) return formatTanggal(a);
  return `${formatTanggal(a)} – ${formatTanggal(b)}`;
}

/** '09:00:00' -> '09:00' */
function hhmm(time) {
  return time ? String(time).slice(0, 5) : null;
}

/** DATETIME -> '18 Mei 2026 - 08.47 WIB' */
function formatWaktuPresensi(value) {
  if (!value) return null;
  const d = new Date(value);
  return `${formatTanggal(d, true)} - ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} WIB`;
}

/** DATETIME -> '17 Mei 2026, 10:15' */
function formatTanggalJam(value, suffix = '') {
  if (!value) return null;
  const d = new Date(value);
  return `${formatTanggal(d)}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}${suffix}`;
}

/** DATETIME lokal (WIB) -> ISO string dengan offset +07:00 */
function toISOStringWIB(value) {
  if (!value) return null;
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+07:00`;
}

function initials(name = '') {
  return name
    .replace(/^(Prof\.|Dr\.|Ir\.)\s*/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/** Jarak dua titik GPS dalam meter (haversine) */
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Tanggal sesi presensi untuk kegiatan [start..end]:
 * hari ini bila berada dalam rentang kegiatan, selain itu tanggal mulai.
 */
function attendanceSessionDate(start, end) {
  const today = toISODate(new Date());
  const s = toISODate(start);
  const e = toISODate(end) || s;
  return s && today >= s && today <= e ? today : s;
}

module.exports = {
  BULAN,
  toISODate,
  attendanceSessionDate,
  formatTanggal,
  formatRentang,
  formatWaktuPresensi,
  formatTanggalJam,
  toISOStringWIB,
  hhmm,
  initials,
  slugify,
  distanceMeters,
};
