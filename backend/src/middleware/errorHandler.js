/**
 * Centralized Error Handling Middleware
 */

const logger = require('../utils/logger');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn(`Malformed JSON in request body from ${req.ip}: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
      errorCode: 'INVALID_JSON'
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  logger.error(`Error processing [${req.method}] ${req.originalUrl}: ${message}`, err);

  const payload = {
    success: false,
    message,
    errorCode: err.code || (statusCode === 404 ? 'RESOURCE_NOT_FOUND' : 'INTERNAL_SERVER_ERROR')
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  if (config.env === 'development') {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = errorHandler;
