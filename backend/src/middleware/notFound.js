/**
 * 404 Not Found Middleware for unmapped routes
 */

const ApiResponse = require('../utils/apiResponse');

function notFound(req, res) {
  return ApiResponse.error(
    res,
    `Route [${req.method}] ${req.originalUrl} does not exist.`,
    404,
    null,
    'ROUTE_NOT_FOUND'
  );
}

module.exports = notFound;
