const { requireFields } = require('../../utils/http.util');

/**
 * Validasi skema request untuk modul locations
 */
const locationsValidation = {
  create(req) {
    const errors = requireFields(req.body, ['gedung', 'ruangan']);
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = locationsValidation;
