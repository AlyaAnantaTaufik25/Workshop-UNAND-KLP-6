const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul locations
 * Fitur: Manajemen Gedung dan Ruangan Kegiatan
 */
class LocationsRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new LocationsRepository();
