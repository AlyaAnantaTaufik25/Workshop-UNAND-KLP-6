const workshopsService = require('./workshops.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul workshops
 * Fitur: Manajemen Kegiatan Workshop
 */
class WorkshopsController {
  constructor() {
    this.service = workshopsService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul workshops (Rencana Pengembangan)', {
      module: 'workshops',
      status: 'PLANNED',
      description: 'Manajemen Kegiatan Workshop',
    });
  }
}

module.exports = new WorkshopsController();
