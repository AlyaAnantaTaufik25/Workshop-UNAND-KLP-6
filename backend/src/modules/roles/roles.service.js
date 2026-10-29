const rolesRepository = require('./roles.repository');

/**
 * Business Logic Layer untuk modul roles
 * Fitur: Manajemen Role dan Hak Akses
 */
class RolesService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = rolesRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new RolesService();
