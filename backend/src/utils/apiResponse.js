/**
 * Standard API Response Helpers
 * Keeps API contracts uniform across all endpoints.
 */

class ApiResponse {
  /**
   * Send a successful JSON response
   */
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a 201 Created response
   */
  static created(res, data = null, message = 'Resource created successfully', meta = null) {
    return ApiResponse.success(res, data, message, 201, meta);
  }

  /**
   * Send an error response
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = null, errorCode = null) {
    const payload = {
      success: false,
      message
    };
    if (errors) {
      payload.errors = Array.isArray(errors) ? errors : [errors];
    }
    if (errorCode) {
      payload.errorCode = errorCode;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
