const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul reports
 * Fitur: Dashboard dan Laporan Kegiatan Workshop
 */
class ReportsRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new ReportsRepository();
