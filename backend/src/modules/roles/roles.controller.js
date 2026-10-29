const rolesService = require('./roles.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul roles
 * Fitur: Manajemen Role dan Hak Akses
 */
class RolesController {
  constructor() {
    this.service = rolesService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul roles (Rencana Pengembangan)', {
      module: 'roles',
      status: 'PLANNED',
      description: 'Manajemen Role dan Hak Akses',
    });
  }
}

module.exports = new RolesController();
