/**
 * Error HTTP yang dapat dilempar dari service/controller dan
 * ditangani oleh errorHandler.middleware.
 */
class HttpError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
  }
}

const badRequest = (msg, errors) => new HttpError(400, msg, errors);
const unauthorized = (msg = 'Sesi tidak valid, silakan masuk kembali') => new HttpError(401, msg);
const forbidden = (msg = 'Anda tidak memiliki izin untuk aksi ini') => new HttpError(403, msg);
const notFound = (msg = 'Data tidak ditemukan') => new HttpError(404, msg);
const conflict = (msg, errors) => new HttpError(409, msg, errors);
const unprocessable = (msg, errors) => new HttpError(422, msg, errors);
const tooMany = (msg = 'Terlalu banyak percobaan, coba lagi nanti') => new HttpError(429, msg);

/** Membungkus handler async agar error diteruskan ke errorHandler */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Validasi field wajib; mengembalikan daftar pesan error */
function requireFields(body, fields) {
  return fields
    .filter((f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === '')
    .map((f) => `Field '${f}' wajib diisi`);
}

module.exports = {
  tooMany,
  HttpError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  asyncHandler,
  requireFields,
};
