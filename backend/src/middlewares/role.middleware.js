const { errorResponse } = require('../utils/response.util');

/**
 * Middleware otorisasi role. Kode role: peserta, humas, sekretariat, rektor, mitra.
 * Harus dipasang setelah authenticate.
 *
 * @param {...string} allowedRoles
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
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
