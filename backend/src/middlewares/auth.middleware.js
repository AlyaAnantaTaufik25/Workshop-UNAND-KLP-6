const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const { pool } = require('../config/database');
const { errorResponse } = require('../utils/response.util');

async function loadUser(token) {
  const decoded = jwt.verify(token, config.jwt.secret);
  const [rows] = await pool.query(
    `SELECT u.id, u.nama, u.email, u.status, u.partner_id, r.code AS role
     FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [decoded.sub]
  );
  const user = rows[0];
  if (!user || user.status !== 'Aktif') return null;
  return { id: user.id, nama: user.nama, email: user.email, role: user.role, partnerId: user.partner_id };
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/**
 * Wajib login. Memverifikasi JWT dan memasang req.user
 * { id, nama, email, role, partnerId }.
 */
async function authenticate(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return errorResponse(res, 'Akses ditolak: Token autentikasi tidak ditemukan', ['Unauthorized'], 401);
  }
  try {
    const user = await loadUser(token);
    if (!user) return errorResponse(res, 'Akun tidak ditemukan atau nonaktif', ['Unauthorized'], 401);
    req.user = user;
    return next();
  } catch (err) {
    return errorResponse(res, 'Sesi tidak valid atau kedaluwarsa, silakan masuk kembali', [err.message], 401);
  }
}

/** Login opsional: memasang req.user bila token valid, tanpa menolak request publik. */
async function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = await loadUser(token);
    } catch {
      req.user = null;
    }
  }
  return next();
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

module.exports = {
  authenticate,
  optionalAuth,
  signToken,
};
