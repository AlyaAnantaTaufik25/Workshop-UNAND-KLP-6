const usersService = require('./users.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul users
 */
class UsersController {
  constructor() {
    this.service = usersService;
  }

  list = async (req, res) => successResponse(res, 'Daftar pengguna', await this.service.list(req.query));

  get = async (req, res) => successResponse(res, 'Detail pengguna', await this.service.get(req.params.id, req.user));

  create = async (req, res) => successResponse(res, 'Pengguna berhasil ditambahkan (kata sandi awal: password123)', await this.service.create(req.body), 201);

  update = async (req, res) => successResponse(res, 'Pengguna berhasil diperbarui', await this.service.update(req.params.id, req.body, req.user));

  setStatus = async (req, res) => successResponse(res, 'Status pengguna diperbarui', await this.service.setStatus(req.params.id, req.body.status, req.user));

  /** Menonaktifkan akun (soft delete) */
  remove = async (req, res) => successResponse(res, 'Pengguna dinonaktifkan', await this.service.setStatus(req.params.id, 'Nonaktif', req.user));
}

module.exports = new UsersController();
