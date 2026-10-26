/**
 * Order Request Validator
 */

const ApiResponse = require('../utils/apiResponse');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ORDER_STATUSES = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

function validateOrderInput(data) {
  const errors = [];

  if (!data.customer || typeof data.customer !== 'object') {
    errors.push('Customer information object is required.');
    return errors;
  }

  const { name, email, address, city, postalCode } = data.customer;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Customer name is required (min 2 characters).');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid customer email address is required.');
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    errors.push('Shipping address is required (min 5 characters).');
  }

  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    errors.push('City is required.');
  }

  if (!postalCode || typeof postalCode !== 'string' || postalCode.trim().length < 3) {
    errors.push('Postal / ZIP code is required.');
  }

  return errors;
}

function validateOrderStatusInput(data) {
  const errors = [];
  if (!data.status || typeof data.status !== 'string') {
    errors.push('Status string is required.');
  } else if (!VALID_ORDER_STATUSES.has(data.status.toLowerCase())) {
    errors.push(`Invalid order status. Allowed: ${Array.from(VALID_ORDER_STATUSES).join(', ')}`);
  }
  return errors;
}

function validateOrderMiddleware(req, res, next) {
  const errors = validateOrderInput(req.body);
  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation failed for order placement', 400, errors, 'VALIDATION_ERROR');
  }
  next();
}

function validateOrderStatusMiddleware(req, res, next) {
  const errors = validateOrderStatusInput(req.body);
  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation failed for order status update', 400, errors, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = {
  EMAIL_REGEX,
  VALID_ORDER_STATUSES,
  validateOrderInput,
  validateOrderStatusInput,
  validateOrderMiddleware,
  validateOrderStatusMiddleware
};
