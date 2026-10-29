const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul partners
 * Fitur: Manajemen Mitra Workshop
 */
class PartnersRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new PartnersRepository();
