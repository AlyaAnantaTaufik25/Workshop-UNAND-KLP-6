const locationsService = require('./locations.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul locations
 */
class LocationsController {
  constructor() {
    this.service = locationsService;
  }

  list = async (req, res) => successResponse(res, 'Daftar gedung & ruangan', await this.service.list());

  get = async (req, res) => successResponse(res, 'Detail lokasi', await this.service.get(req.params.id));

  create = async (req, res) => successResponse(res, 'Lokasi berhasil ditambahkan', await this.service.create(req.body), 201);

  update = async (req, res) => successResponse(res, 'Lokasi berhasil diperbarui', await this.service.update(req.params.id, req.body));

  remove = async (req, res) => {
    await this.service.remove(req.params.id);
    return successResponse(res, 'Lokasi berhasil dihapus', null);
  };
}

module.exports = new LocationsController();
