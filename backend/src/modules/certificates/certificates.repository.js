const { pool } = require('../../config/database');

/**
 * Data Access Layer untuk modul certificates
 * Fitur: Manajemen Template, Penerbitan, TTE, dan Verifikasi Sertifikat
 */
class CertificatesRepository {
  /**
   * Konstruktor repository
   */
  constructor() {
    this.db = pool;
  }

  // TODO: Tambahkan query database terisolasi di sini
}

module.exports = new CertificatesRepository();
