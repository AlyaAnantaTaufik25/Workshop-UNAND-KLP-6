const { errorResponse } = require('../utils/response.util');

/**
 * Placeholder Middleware Otorisasi Role
 * 5 Aktor Utama: Peserta, Humas UNAND, Sekretariat Rektor, Rektor, Mitra
 *
 * @param {string[]} allowedRoles
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // TODO: Sesuaikan dengan req.user.role setelah modul Auth aktif
    const userRole = req.user ? req.user.role : null;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        'Akses terlarang: Anda tidak memiliki izin untuk mengakses resource ini',
        [`Role '${userRole}' tidak diizinkan. Dibutuhkan: ${allowedRoles.join(', ')}`],
        403
      );
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};

