const attendanceService = require('./attendance.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul attendance
 * Fitur: Presensi Peserta Workshop (QR Code & Validasi Lokasi)
 */
class AttendanceController {
  constructor() {
    this.service = attendanceService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul attendance (Rencana Pengembangan)', {
      module: 'attendance',
      status: 'PLANNED',
      description: 'Presensi Peserta Workshop (QR Code & Validasi Lokasi)',
    });
  }
}

module.exports = new AttendanceController();
