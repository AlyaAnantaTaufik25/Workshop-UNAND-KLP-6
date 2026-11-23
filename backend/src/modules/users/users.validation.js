const { requireFields } = require('../../utils/http.util');

/**
 * Validasi skema request untuk modul users
 */
const usersValidation = {
  create(req) {
    const errors = requireFields(req.body, ['nama', 'email', 'role']);
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) errors.push('Format email tidak valid');
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = usersValidation;
