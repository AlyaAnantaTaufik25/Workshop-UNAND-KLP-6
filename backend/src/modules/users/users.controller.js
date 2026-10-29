const usersService = require('./users.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul users
 * Fitur: Manajemen Pengguna (Peserta, Humas, Sekretariat, Rektor, Mitra)
 */
class UsersController {
  constructor() {
    this.service = usersService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul users (Rencana Pengembangan)', {
      module: 'users',
      status: 'PLANNED',
      description: 'Manajemen Pengguna (Peserta, Humas, Sekretariat, Rektor, Mitra)',
    });
  }
}

module.exports = new UsersController();
