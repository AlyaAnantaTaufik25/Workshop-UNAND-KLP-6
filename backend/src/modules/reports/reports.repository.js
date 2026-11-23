const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul reports
 */
class ReportsRepository {
  constructor() {
    this.db = pool;
  }

  /** Rekap presensi per kegiatan per hari */
  async dailyAttendance(partnerId = null) {
    const [rows] = await this.db.query(
      `SELECT w.id AS workshop_id, w.nama, w.mode, w.tanggal_mulai, w.tanggal_selesai, w.status_presensi,
              a.tanggal, SUM(a.status = 'hadir') AS hadir, SUM(a.status = 'pending') AS pending,
              SUM(a.status = 'ditolak') AS ditolak, COUNT(a.id) AS total_absen
       FROM workshops w
       JOIN registrations r ON r.workshop_id = w.id AND r.status IN ('terdaftar','selesai')
       LEFT JOIN attendances a ON a.registration_id = r.id
       WHERE w.status <> 'draft' ${partnerId ? 'AND w.partner_id = ?' : ''}
       GROUP BY w.id, a.tanggal
       ORDER BY w.tanggal_mulai DESC, a.tanggal`,
      partnerId ? [partnerId] : []
    );
    return rows;
  }

  async counts(partnerId = null) {
    const pw = partnerId ? 'AND w.partner_id = ?' : '';
    const p = partnerId ? [partnerId] : [];
    const [[row]] = await this.db.query(
      `SELECT
        (SELECT COUNT(*) FROM certificates c JOIN workshops w ON w.id = c.workshop_id WHERE 1=1 ${pw}) AS sertifikat_terbit,
        (SELECT COUNT(*) FROM certificate_submissions s JOIN workshops w ON w.id = s.workshop_id WHERE s.status <> 'diterbitkan' ${pw}) AS menunggu_ttd,
        (SELECT COUNT(*) FROM certificate_corrections c JOIN certificates ce ON ce.id = c.certificate_id JOIN workshops w ON w.id = ce.workshop_id
           WHERE c.status IN ('menunggu','diproses') ${pw}) AS perbaikan_aktif`,
      [...p, ...p, ...p]
    );
    return row;
  }
}

module.exports = new ReportsRepository();
