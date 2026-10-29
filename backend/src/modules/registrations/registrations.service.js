const registrationsRepository = require('./registrations.repository');

/**
 * Business Logic Layer untuk modul registrations
 * Fitur: Pendaftaran Peserta Workshop dan Waiting List
 */
class RegistrationsService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = registrationsRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new RegistrationsService();
