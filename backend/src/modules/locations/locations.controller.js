const locationsService = require('./locations.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul locations
 * Fitur: Manajemen Gedung dan Ruangan Kegiatan
 */
class LocationsController {
  constructor() {
    this.service = locationsService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul locations (Rencana Pengembangan)', {
      module: 'locations',
      status: 'PLANNED',
      description: 'Manajemen Gedung dan Ruangan Kegiatan',
    });
  }
}

module.exports = new LocationsController();
