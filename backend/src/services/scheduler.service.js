/**
 * Tugas latar belakang sederhana (tanpa dependensi cron):
 *  - kirim antrean email setiap menit,
 *  - pengingat H-1 kegiatan untuk peserta terdaftar (sekali per pendaftaran).
 * Dimatikan dengan SCHEDULER_ENABLED=false (mis. saat pengujian).
 */
const { pool } = require('../config/database');
const mailer = require('./mailer.service');
const { notify } = require('./notifier.service');
const logger = require('../utils/logger.util');

const timers = [];

/** Peserta terdaftar pada kegiatan yang dimulai BESOK dan belum diingatkan */
async function sendReminders() {
  const [rows] = await pool.query(
    `SELECT r.id AS registration_id, r.user_id, w.nama, w.slug, w.tanggal_mulai, w.waktu_mulai, w.mode,
            COALESCE(w.tempat, CONCAT_WS(' · ', l.gedung, l.ruangan)) AS tempat
     FROM registrations r
     JOIN workshops w ON w.id = r.workshop_id
     LEFT JOIN locations l ON l.id = w.location_id
     WHERE r.status = 'terdaftar' AND r.reminder_sent_at IS NULL
       AND w.status NOT IN ('dibatalkan', 'draft')
       AND w.tanggal_mulai = CURDATE() + INTERVAL 1 DAY
     LIMIT 500`
  );
  for (const r of rows) {
    const jam = r.waktu_mulai ? ` pukul ${String(r.waktu_mulai).slice(0, 5)} WIB` : '';
    const tempat = r.mode === 'online' ? 'secara online (tautan di halaman Workshop Saya)' : `di ${r.tempat || 'lokasi kegiatan'}`;
    await notify({ userId: r.user_id }, {
      judul: `Pengingat: ${r.nama} besok`,
      deskripsi: `Kegiatan dimulai besok${jam} ${tempat}. Jangan lupa isi presensi saat kegiatan berlangsung.`,
      link: '/peserta/workshop-saya',
    });
    await pool.query('UPDATE registrations SET reminder_sent_at = NOW() WHERE id = ?', [r.registration_id]);
  }
  if (rows.length) logger.info(`[Scheduler] ${rows.length} pengingat H-1 dikirim`);
  return rows.length;
}

function every(ms, name, fn) {
  const run = async () => {
    try { await fn(); } catch (err) { logger.warn(`[Scheduler] ${name} gagal: ${err.message}`); }
  };
  setTimeout(run, 5000);
  timers.push(setInterval(run, ms));
}

function start() {
  if (process.env.SCHEDULER_ENABLED === 'false') return;
  every(60 * 1000, 'kirim email', () => mailer.flush());
  every(10 * 60 * 1000, 'pengingat H-1', sendReminders);
  logger.info('[Scheduler] Aktif: antrean email (1 mnt), pengingat H-1 (10 mnt)');
}

function stop() { timers.splice(0).forEach(clearInterval); }

module.exports = { start, stop, sendReminders };
