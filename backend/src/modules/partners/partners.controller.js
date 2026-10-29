const partnersService = require('./partners.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul partners
 * Fitur: Manajemen Mitra Workshop
 */
class PartnersController {
  constructor() {
    this.service = partnersService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul partners (Rencana Pengembangan)', {
      module: 'partners',
      status: 'PLANNED',
      description: 'Manajemen Mitra Workshop',
    });
  }
}

module.exports = new PartnersController();
