const partnersRepository = require('./partners.repository');

/**
 * Business Logic Layer untuk modul partners
 * Fitur: Manajemen Mitra Workshop
 */
class PartnersService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = partnersRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new PartnersService();
