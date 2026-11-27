/**
 * Berkas kalender iCalendar (.ics) untuk satu kegiatan — bisa diimpor ke
 * Google Calendar, Outlook, atau Kalender iPhone/Android. Waktu memakai WIB (Asia/Jakarta).
 */
const APP_URL = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');

const pad = (n) => String(n).padStart(2, '0');
const icsDate = (date, time) => `${String(date).slice(0, 10).replace(/-/g, '')}T${String(time || '00:00:00').slice(0, 8).replace(/:/g, '').padEnd(6, '0')}`;
const escape = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
/** Lipat baris > 75 oktet sesuai RFC 5545 */
const fold = (line) => {
  const out = []; let rest = line;
  while (Buffer.byteLength(rest) > 74) {
    let cut = 74;
    while (Buffer.byteLength(rest.slice(0, cut)) > 74) cut--;
    out.push(rest.slice(0, cut)); rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join('\r\n');
};
const stamp = () => {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};

/**
 * @param w { id, slug, nama, deskripsi, tanggal_mulai, tanggal_selesai, waktu_mulai, waktu_selesai, mode, meeting_url, lokasiTeks }
 */
function buildIcs(w) {
  const url = `${APP_URL}/peserta/workshop/${w.slug || w.id}`;
  const lokasi = w.mode === 'online' ? `Online${w.meeting_url ? ` — ${w.meeting_url}` : ''}` : (w.lokasiTeks || 'Universitas Andalas, Padang');
  const desc = [w.deskripsi, '', `Detail & presensi: ${url}`].filter((x) => x !== undefined && x !== null).join('\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Universitas Andalas//Sistem Informasi Workshop//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Jakarta',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:WIB',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:workshop-${w.id}@workshop.unand.ac.id`,
    `DTSTAMP:${stamp()}`,
    `DTSTART;TZID=Asia/Jakarta:${icsDate(w.tanggal_mulai, w.waktu_mulai || '08:00:00')}`,
    `DTEND;TZID=Asia/Jakarta:${icsDate(w.tanggal_selesai || w.tanggal_mulai, w.waktu_selesai || '16:00:00')}`,
    `SUMMARY:${escape(w.nama)}`,
    `DESCRIPTION:${escape(desc)}`,
    `LOCATION:${escape(lokasi)}`,
    `URL:${url}`,
    'ORGANIZER;CN=Workshop UNAND:mailto:no-reply@unand.ac.id',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(`Besok: ${w.nama}`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(`1 jam lagi: ${w.nama}`)}`,
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

module.exports = { buildIcs };
