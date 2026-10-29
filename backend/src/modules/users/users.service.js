const usersRepository = require('./users.repository');

/**
 * Business Logic Layer untuk modul users
 * Fitur: Manajemen Pengguna (Peserta, Humas, Sekretariat, Rektor, Mitra)
 */
class UsersService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = usersRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new UsersService();
