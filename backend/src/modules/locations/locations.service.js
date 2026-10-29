const locationsRepository = require('./locations.repository');

/**
 * Business Logic Layer untuk modul locations
 * Fitur: Manajemen Gedung dan Ruangan Kegiatan
 */
class LocationsService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = locationsRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new LocationsService();
