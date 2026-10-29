const { errorResponse } = require('../utils/response.util');

/**
 * 404 Not Found Middleware untuk rute yang tidak terdaftar
 */
function notFoundHandler(req, res, next) { // eslint-disable-line no-unused-vars
  return errorResponse(
    res,
    `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    [{ path: req.originalUrl, method: req.method }],
    404
  );
}

module.exports = notFoundHandler;

