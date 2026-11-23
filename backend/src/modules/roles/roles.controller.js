const rolesService = require('./roles.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul roles
 */
class RolesController {
  constructor() {
    this.service = rolesService;
  }

  list = async (req, res) => successResponse(res, 'Daftar role', await this.service.list());
}

module.exports = new RolesController();
