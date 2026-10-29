const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul attendance
 * Fitur: Presensi Peserta Workshop (QR Code & Validasi Lokasi)
 */
class AttendanceRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new AttendanceRepository();
