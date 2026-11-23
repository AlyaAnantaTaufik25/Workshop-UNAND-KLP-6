const { requireFields } = require('../../utils/http.util');

const wrap = (errors) => (errors.length ? { error: { details: errors } } : {});

/**
 * Validasi skema request untuk modul certificates
 */
const certificatesValidation = {
  template: (req) => wrap(requireFields(req.body, ['nama'])),
  submission: (req) => wrap(requireFields(req.body, ['workshopId'])),
  sign: (req) => wrap(requireFields(req.body, ['pin'])),
  correction: (req) => wrap(requireFields(req.body, ['certificateId', 'reason'])),
  process: (req) => wrap(requireFields(req.body, ['action'])),
};

module.exports = certificatesValidation;
