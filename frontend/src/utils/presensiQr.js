/* Helper tautan & pembacaan QR presensi (dipakai QrPresensi & QrScanner) */
/** Tautan yang dikodekan di QR: dibuka kamera ponsel → langsung ke form presensi dengan kode terisi */
export const presensiLink = (slug, token) =>
  `${window.location.origin}/peserta/workshop-saya?presensi=${encodeURIComponent(slug)}&kode=${encodeURIComponent(token)}`;

/** Ambil kode presensi dari hasil pindai (tautan presensi atau kode mentah) */
export function parsePresensiQr(text) {
  const raw = String(text || '').trim();
  try {
    const url = new URL(raw);
    return { code: url.searchParams.get('kode') || '', workshop: url.searchParams.get('presensi') || '' };
  } catch {
    return { code: raw.slice(0, 128), workshop: '' };
  }
}
