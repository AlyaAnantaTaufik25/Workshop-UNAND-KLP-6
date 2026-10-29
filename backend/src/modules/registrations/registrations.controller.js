const registrationsService = require('./registrations.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul registrations
 * Fitur: Pendaftaran Peserta Workshop dan Waiting List
 */
class RegistrationsController {
  constructor() {
    this.service = registrationsService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul registrations (Rencana Pengembangan)', {
      module: 'registrations',
      status: 'PLANNED',
      description: 'Pendaftaran Peserta Workshop dan Waiting List',
    });
  }
}

module.exports = new RegistrationsController();
