const partnersService = require('./partners.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul partners
 */
class PartnersController {
  constructor() {
    this.service = partnersService;
  }

  list = async (req, res) => successResponse(res, 'Daftar mitra', await this.service.list(req.user));

  get = async (req, res) => successResponse(res, 'Detail mitra', await this.service.get(req.params.id, req.user));

  create = async (req, res) => successResponse(res, 'Mitra berhasil ditambahkan', await this.service.create(req.body), 201);

  update = async (req, res) => successResponse(res, 'Mitra berhasil diperbarui', await this.service.update(req.params.id, req.body));

  remove = async (req, res) => {
    await this.service.remove(req.params.id);
    return successResponse(res, 'Mitra berhasil dihapus', null);
  };

  workshops = async (req, res) => successResponse(res, 'Kegiatan mitra', await this.service.workshops(req.params.id, req.user));
}

module.exports = new PartnersController();
