const workshopsService = require('./workshops.service');
const { buildIcs } = require('../../services/calendar.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul workshops
 */
class WorkshopsController {
  constructor() {
    this.service = workshopsService;
  }

  list = async (req, res) => successResponse(res, 'Daftar kegiatan', await this.service.list(req.user, req.query));

  /** Berkas kalender (.ics) kegiatan — Google Calendar, Outlook, iPhone/Android */
  calendar = async (req, res) => {
    const w = await this.service.getRow(req.params.id, req.user);
    const ics = buildIcs({ ...w, lokasiTeks: w.tempat || [w.gedung, w.ruangan].filter(Boolean).join(' · ') });
    res.set({ 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${w.slug || w.id}.ics"` });
    return res.send(ics);
  };

  detail = async (req, res) => successResponse(res, 'Detail kegiatan', await this.service.detail(req.params.id, req.user));

  create = async (req, res) => successResponse(res, 'Kegiatan berhasil dibuat', await this.service.create(req.body, req.user), 201);

  update = async (req, res) => successResponse(res, 'Kegiatan berhasil diperbarui', await this.service.update(req.params.id, req.body, req.user));

  updateStatus = async (req, res) => {
    const { status, statusPendaftaran, statusPresensi } = req.body;
    const data = await this.service.update(req.params.id, { status, statusPendaftaran, statusPresensi }, req.user);
    return successResponse(res, 'Status kegiatan diperbarui', data);
  };

  remove = async (req, res) => {
    await this.service.remove(req.params.id, req.user);
    return successResponse(res, 'Kegiatan berhasil dihapus', null);
  };
}

module.exports = new WorkshopsController();
