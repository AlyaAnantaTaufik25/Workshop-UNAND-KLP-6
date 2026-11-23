const { errorResponse } = require('../utils/response.util');

/**
 * Centralized Error Handler Middleware
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Duplikat data unik dari MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'Data yang sama sudah terdaftar', [err.sqlMessage], 409);
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return errorResponse(res, 'Data masih dipakai oleh data lain sehingga tidak dapat dihapus', [err.sqlMessage], 409);
  }
  if (err.type === 'entity.too.large') {
    return errorResponse(res, 'Ukuran berkas terlalu besar', [err.message], 413);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV !== 'development'
    ? 'Terjadi kesalahan pada server'
    : err.message || 'Internal Server Error';
  const errors = err.errors || (process.env.NODE_ENV === 'development' ? [err.stack] : []);

  if (statusCode >= 500) console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  return errorResponse(res, message, errors, statusCode);
}

module.exports = errorHandler;
