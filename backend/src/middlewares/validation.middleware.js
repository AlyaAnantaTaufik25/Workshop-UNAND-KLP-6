const { errorResponse } = require('../utils/response.util');

/**
 * Placeholder Middleware Validasi Request Body / Query / Params
 * Dapat dihubungkan dengan library schema validator (seperti Joi, Zod, atau express-validator).
 *
 * @param {Function} validatorFn
 */
function validate(validatorFn) {
  return (req, res, next) => {
    if (typeof validatorFn !== 'function') {
      return next();
    }

    const { error } = validatorFn(req);
    if (error) {
      return errorResponse(res, 'Validasi gagal', error.details || [error.message], 422);
    }

    return next();
  };
}

module.exports = {
  validate,
};

