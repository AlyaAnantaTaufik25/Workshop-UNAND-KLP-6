const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul auth
 * Fitur: Autentikasi dan Manajemen Sesi Pengguna
 */
class AuthRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new AuthRepository();
