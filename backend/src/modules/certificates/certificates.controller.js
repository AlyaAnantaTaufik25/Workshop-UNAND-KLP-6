const certificatesService = require('./certificates.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul certificates
 * Fitur: Manajemen Template, Penerbitan, TTE, dan Verifikasi Sertifikat
 */
class CertificatesController {
  constructor() {
    this.service = certificatesService;
  }

  /**
   * Endpoint informasi modul
   */
  index(req, res) {
    return successResponse(res, 'Endpoint modul certificates (Rencana Pengembangan)', {
      module: 'certificates',
      status: 'PLANNED',
      description: 'Manajemen Template, Penerbitan, TTE, dan Verifikasi Sertifikat',
    });
  }
}

module.exports = new CertificatesController();
