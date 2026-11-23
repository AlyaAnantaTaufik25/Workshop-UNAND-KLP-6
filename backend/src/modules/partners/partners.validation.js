const { requireFields } = require('../../utils/http.util');

/**
 * Validasi skema request untuk modul partners
 */
const partnersValidation = {
  create(req) {
    const errors = requireFields(req.body, ['nama']);
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = partnersValidation;
