const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul registrations
 * Fitur: Pendaftaran Peserta Workshop dan Waiting List
 */
class RegistrationsRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new RegistrationsRepository();
