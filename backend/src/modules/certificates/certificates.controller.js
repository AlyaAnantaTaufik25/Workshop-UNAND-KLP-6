const certificatesService = require('./certificates.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul certificates
 */
class CertificatesController {
  constructor() {
    this.service = certificatesService;
  }

  // Template
  listTemplates = async (req, res) => successResponse(res, 'Daftar template sertifikat', await this.service.listTemplates(req.user, req.query));
  createTemplate = async (req, res) => successResponse(res, 'Template berhasil ditambahkan', await this.service.createTemplate(req.body, req.user), 201);
  updateTemplate = async (req, res) => successResponse(res, 'Template berhasil diperbarui', await this.service.updateTemplate(req.params.id, req.body, req.user));
  deleteTemplate = async (req, res) => {
    await this.service.deleteTemplate(req.params.id, req.user);
    return successResponse(res, 'Template berhasil dihapus', null);
  };
  templateFile = async (req, res) => successResponse(res, 'Berkas template', await this.service.templateFile(req.params.id, req.user));

  // Pengajuan & TTE
  listSubmissions = async (req, res) => successResponse(res, 'Daftar pengajuan sertifikat', await this.service.listSubmissions(req.user));
  getSubmission = async (req, res) => successResponse(res, 'Detail pengajuan sertifikat', await this.service.getSubmission(req.params.id, req.user));
  createSubmission = async (req, res) => successResponse(res, 'Sertifikat berhasil diajukan', await this.service.createSubmission(req.body, req.user), 201);
  signSubmission = async (req, res) => successResponse(res, 'Tanda tangan elektronik berhasil dibubuhkan', await this.service.signSubmission(req.params.id, req.body, req.user));

  // Sertifikat
  my = async (req, res) => successResponse(res, 'Sertifikat saya', await this.service.myCertificates(req.user));
  verify = async (req, res) => successResponse(res, 'Sertifikat valid', await this.service.verifyCertificate(req.params.serialNumber));

  // Perbaikan
  listCorrections = async (req, res) => successResponse(res, 'Daftar perbaikan sertifikat', await this.service.listCorrections(req.user));
  getCorrection = async (req, res) => successResponse(res, 'Detail perbaikan', await this.service.getCorrection(req.params.id, req.user));
  createCorrection = async (req, res) => successResponse(res, 'Pengajuan perbaikan terkirim', await this.service.createCorrection(req.body, req.user), 201);
  cancelCorrection = async (req, res) => successResponse(res, 'Pengajuan dibatalkan', await this.service.cancelCorrection(req.params.id, req.user));
  markRead = async (req, res) => successResponse(res, 'Notifikasi ditandai dibaca', await this.service.markRead(req.user, req.body.id));
  processCorrection = async (req, res) => successResponse(res, 'Pengajuan perbaikan diperbarui', await this.service.processCorrection(req.params.id, req.body, req.user));

  // Dokumen pengganti
  listReplacements = async (req, res) => successResponse(res, 'Daftar dokumen pengganti', await this.service.listReplacements(req.user));
  getReplacement = async (req, res) => successResponse(res, 'Detail dokumen pengganti', await this.service.getReplacement(req.params.id, req.user));
  signReplacement = async (req, res) => successResponse(res, 'Dokumen pengganti berhasil ditandatangani', await this.service.signReplacement(req.params.id, req.body, req.user));
}

module.exports = new CertificatesController();
