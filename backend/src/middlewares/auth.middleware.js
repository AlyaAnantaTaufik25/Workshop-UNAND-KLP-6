const { errorResponse } = require('../utils/response.util');

/**
 * Placeholder Middleware Autentikasi JWT
 * Akan diimplementasikan penuh pada tahap pengembangan modul Auth.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Akses ditolak: Token autentikasi tidak ditemukan', ['Unauthorized'], 401);
  }

  // TODO: Verifikasi token JWT dan pasang req.user
  // const token = authHeader.split(' ')[1];
  // const decoded = jwt.verify(token, config.jwt.secret);
  // req.user = decoded;

  return next();
}

module.exports = {
  authenticate,
};

