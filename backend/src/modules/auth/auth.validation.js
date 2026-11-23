const { requireFields } = require('../../utils/http.util');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validasi skema request untuk modul auth.
 * Setiap validator menerima req dan mengembalikan { error } bila gagal.
 */
const authValidation = {
  login(req) {
    const errors = requireFields(req.body, ['email', 'password']);
    return errors.length ? { error: { details: errors } } : {};
  },
  register(req) {
    const errors = requireFields(req.body, ['nama', 'email', 'password']);
    if (req.body.email && !EMAIL_RE.test(req.body.email)) errors.push('Format email tidak valid');
    if (req.body.password && String(req.body.password).length < 8) errors.push('Kata sandi minimal 8 karakter');
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = authValidation;
