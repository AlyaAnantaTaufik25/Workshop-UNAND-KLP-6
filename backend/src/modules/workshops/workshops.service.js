const workshopsRepository = require('./workshops.repository');

/**
 * Business Logic Layer untuk modul workshops
 * Fitur: Manajemen Kegiatan Workshop
 */
class WorkshopsService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = workshopsRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new WorkshopsService();
