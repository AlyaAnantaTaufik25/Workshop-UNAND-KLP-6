const attendanceService = require('./attendance.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul attendance
 */
class AttendanceController {
  constructor() {
    this.service = attendanceService;
  }

  checkIn = async (req, res) => successResponse(res, 'Presensi berhasil, kehadiran Anda tervalidasi', await this.service.checkIn(req.user, req.body));

  upload = async (req, res) => successResponse(res, 'Bukti presensi terkirim, menunggu verifikasi panitia', await this.service.upload(req.user, req.body));

  generateQr = async (req, res) => successResponse(res, 'Kode presensi dibuat', await this.service.generateQr(req.user, req.body), 201);

  verify = async (req, res) => successResponse(res, 'Presensi diverifikasi', await this.service.verify(req.user, req.params.id, req.body));

  byWorkshop = async (req, res) => successResponse(res, 'Rekap presensi', await this.service.byWorkshop(req.user, req.params.workshopId));
}

module.exports = new AttendanceController();
