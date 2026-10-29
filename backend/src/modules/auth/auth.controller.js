const authService = require('./auth.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul auth
 * Fitur: Autentikasi dan Manajemen Sesi Pengguna
 */
class AuthController {
  constructor() {
    this.service = authService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul auth (Rencana Pengembangan)', {
      module: 'auth',
      status: 'PLANNED',
      description: 'Autentikasi dan Manajemen Sesi Pengguna',
    });
  }
}

module.exports = new AuthController();
