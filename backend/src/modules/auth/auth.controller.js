const authService = require('./auth.service');
const { successResponse } = require('../../utils/response.util');

/**
 * Controller Layer untuk modul auth
 */
class AuthController {
  constructor() {
    this.service = authService;
  }

  login = async (req, res) => {
    const data = await this.service.login(req.body.email, req.body.password);
    return successResponse(res, 'Login berhasil', data);
  };

  register = async (req, res) => {
    const data = await this.service.register(req.body);
    return successResponse(res, 'Registrasi berhasil', data, 201);
  };

  me = async (req, res) => successResponse(res, 'Profil pengguna', await this.service.me(req.user.id));

  updateMe = async (req, res) => successResponse(res, 'Profil berhasil diperbarui', await this.service.updateProfile(req.user.id, req.body));

  changePassword = async (req, res) => {
    await this.service.changePassword(req.user.id, req.body);
    return successResponse(res, 'Kata sandi berhasil diubah', null);
  };

  verifyPin = async (req, res) => {
    await this.service.verifyPin(req.user.id, req.body.pin);
    return successResponse(res, 'PIN valid', { valid: true });
  };

  changePin = async (req, res) => {
    await this.service.changePin(req.user.id, req.body);
    return successResponse(res, 'PIN berhasil diubah', null);
  };

  resetPin = async (req, res) => {
    await this.service.resetPin(req.user.id);
    return successResponse(res, 'PIN dikembalikan ke bawaan (123456)', null);
  };

  logout = async (req, res) => successResponse(res, 'Logout berhasil', null);
}

module.exports = new AuthController();
