const { errorResponse } = require('../utils/response.util');

/**
 * Centralized Error Handler Middleware
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || (process.env.NODE_ENV === 'development' ? [err.stack] : []);

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  return errorResponse(res, message, errors, statusCode);
}

module.exports = errorHandler;

