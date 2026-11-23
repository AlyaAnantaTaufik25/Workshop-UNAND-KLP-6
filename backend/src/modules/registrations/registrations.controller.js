const registrationsService = require('./registrations.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul registrations
 */
class RegistrationsController {
  constructor() {
    this.service = registrationsService;
  }

  register = async (req, res) => {
    const data = await this.service.register(req.user, req.body.workshopId);
    const waiting = data.myRegistration && data.myRegistration.status === 'waiting';
    return successResponse(res, waiting ? 'Kuota penuh, Anda masuk waiting list' : 'Pendaftaran berhasil', data, 201);
  };

  cancel = async (req, res) => successResponse(res, 'Pendaftaran dibatalkan', await this.service.cancel(req.user, req.params.id));

  my = async (req, res) => successResponse(res, 'Pendaftaran saya', await this.service.my(req.user));

  list = async (req, res) => successResponse(res, 'Daftar peserta', await this.service.list(req.user, req.query));

  byWorkshop = async (req, res) => successResponse(res, 'Daftar peserta kegiatan', await this.service.list(req.user, { workshopId: req.params.workshopId }));
}

module.exports = new RegistrationsController();
