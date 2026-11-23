const { requireFields } = require('../../utils/http.util');

/**
 * Validasi skema request untuk modul attendance
 */
const attendanceValidation = {
  submit(req) {
    const errors = requireFields(req.body, ['workshopId']);
    return errors.length ? { error: { details: errors } } : {};
  },
};

module.exports = attendanceValidation;
