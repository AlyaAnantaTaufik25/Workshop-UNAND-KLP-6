const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul roles
 * Fitur: Manajemen Role dan Hak Akses
 */
class RolesRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new RolesRepository();
