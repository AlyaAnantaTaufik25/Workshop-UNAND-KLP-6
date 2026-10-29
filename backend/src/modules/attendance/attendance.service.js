const attendanceRepository = require('./attendance.repository');

/**
 * Business Logic Layer untuk modul attendance
 * Fitur: Presensi Peserta Workshop (QR Code & Validasi Lokasi)
 */
class AttendanceService {
  /**
   * Konstruktor service
   */
  constructor() {
    this.repository = attendanceRepository;
  }

  // TODO: Tambahkan implementasi aturan bisnis sistem di sini
}

module.exports = new AttendanceService();
