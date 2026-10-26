/**
 * Contact Submission Validator
 */

const ApiResponse = require('../utils/apiResponse');
const { EMAIL_REGEX } = require('./orderValidator');

function validateContactInput(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  } else if (data.name.trim().length > 80) {
    errors.push('Name cannot exceed 80 characters.');
  }

  if (!data.email || typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
    errors.push('Valid email address is required.');
  }

  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length < 3) {
    errors.push('Subject is required and must be at least 3 characters.');
  } else if (data.subject.trim().length > 150) {
    errors.push('Subject cannot exceed 150 characters.');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters.');
  } else if (data.message.trim().length > 2000) {
    errors.push('Message cannot exceed 2000 characters.');
  }

  return errors;
}

function validateContactMiddleware(req, res, next) {
  const errors = validateContactInput(req.body);
  if (errors.length > 0) {
    return ApiResponse.error(res, 'Contact form validation failed', 400, errors, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = {
  validateContactInput,
  validateContactMiddleware
};
