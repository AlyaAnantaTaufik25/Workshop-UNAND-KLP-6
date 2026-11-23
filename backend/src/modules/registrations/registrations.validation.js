const { requireFields } = require('../../utils/http.util');

/**
 * Validasi skema request untuk modul registrations
 */
const registrationsValidation = {
  register(req) {
    const errors = requireFields(req.body, ['workshopId']);
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = registrationsValidation;
