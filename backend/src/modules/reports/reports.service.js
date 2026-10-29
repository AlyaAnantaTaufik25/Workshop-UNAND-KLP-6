const reportsRepository = require('./reports.repository');

/**
 * Business Logic Layer untuk modul reports
 * Fitur: Dashboard dan Laporan Kegiatan Workshop
 */
class ReportsService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = reportsRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new ReportsService();
