/**
 * Format standar respon berhasil (Success Response)
 * @param {import('express').Response} res
 * @param {string} message
 * @param {object|array|null} data
 * @param {number} statusCode
 */
function successResponse(res, message = 'Berhasil', data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Format standar respon gagal (Error Response)
 * @param {import('express').Response} res
 * @param {string} message
 * @param {array|object|null} errors
 * @param {number} statusCode
 */
function errorResponse(res, message = 'Terjadi kesalahan', errors = [], statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
}

module.exports = {
  successResponse,
  errorResponse,
};

