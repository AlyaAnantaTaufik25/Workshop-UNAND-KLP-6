const reportsService = require('./reports.service');
const workshopsService = require('../workshops/workshops.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul reports
 */
class ReportsController {
  constructor() {
    this.service = reportsService;
  }

  summary = async (req, res) => successResponse(res, 'Ringkasan statistik', await this.service.summary(req.user));

  workshops = async (req, res) => successResponse(res, 'Laporan per kegiatan', await this.service.workshops(req.user));

  daily = async (req, res) => successResponse(res, 'Rekap presensi harian', await this.service.daily(req.user));

  /** Data lengkap satu kegiatan untuk diekspor (PDF/Excel dibuat di frontend) */
  exportWorkshop = async (req, res) => successResponse(res, 'Data ekspor kegiatan', await workshopsService.detail(req.params.id, req.user));
}

module.exports = new ReportsController();
