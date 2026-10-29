const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul users
 * Fitur: Manajemen Pengguna (Peserta, Humas, Sekretariat, Rektor, Mitra)
 */
class UsersRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new UsersRepository();
