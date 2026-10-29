const reportsService = require('./reports.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul reports
 * Fitur: Dashboard dan Laporan Kegiatan Workshop
 */
class ReportsController {
  constructor() {
    this.service = reportsService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul reports (Rencana Pengembangan)', {
      module: 'reports',
      status: 'PLANNED',
      description: 'Dashboard dan Laporan Kegiatan Workshop',
    });
  }
}

module.exports = new ReportsController();
