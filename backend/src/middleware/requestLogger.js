/**
 * Request Logging Middleware
 */

const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logStr = `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`;
    if (res.statusCode >= 500) {
      logger.error(logStr);
    } else if (res.statusCode >= 400) {
      logger.warn(logStr);
    } else {
      logger.info(logStr);
    }
  });
  next();
}

module.exports = requestLogger;
