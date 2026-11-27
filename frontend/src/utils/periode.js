/** Filter periode bersama (dipakai Laporan Humas & portal Mitra) */
export const PERIODE_OPTIONS = [
  { value: '', label: 'Semua periode' },
  { value: 'hari-ini', label: 'Hari ini' },
  { value: '7-hari', label: '7 hari terakhir' },
  { value: '1-bulan', label: '1 bulan terakhir' },
  { value: '3-bulan', label: '3 bulan terakhir' },
];

export const periodeLabel = value => PERIODE_OPTIONS.find(o => o.value === value)?.label || 'Semua periode';

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Rentang tanggal ISO { from, to } untuk nilai periode, atau null bila semua */
export function getDateRange(value, today = new Date()) {
  const to = iso(today);
  const from = new Date(today);
  if (value === 'hari-ini') return { from: to, to };
  if (value === '7-hari') from.setDate(today.getDate() - 6);
  else if (value === '1-bulan') from.setMonth(today.getMonth() - 1);
  else if (value === '3-bulan') from.setMonth(today.getMonth() - 3);
  else return null;
  return { from: iso(from), to };
}

/** Apakah tanggal ISO (YYYY-MM-DD…) berada dalam periode */
export function inPeriode(isoDate, value) {
  const range = getDateRange(value);
  if (!range) return true;
  const d = String(isoDate || '').slice(0, 10);
  return Boolean(d) && d >= range.from && d <= range.to;
}
