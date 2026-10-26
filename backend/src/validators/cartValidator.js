/**
 * Shopping Cart Request Validator
 */

const ApiResponse = require('../utils/apiResponse');

function validateAddToCartInput(data) {
  const errors = [];

  if (!data.productId || typeof data.productId !== 'string' || data.productId.trim() === '') {
    errors.push('Valid productId is required.');
  }

  if (data.quantity !== undefined) {
    if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity < 1) {
      errors.push('Quantity must be an integer of 1 or greater.');
    } else if (data.quantity > 99) {
      errors.push('Maximum quantity per item is 99.');
    }
  }

  return errors;
}

function validateUpdateQuantityInput(data) {
  const errors = [];

  if (data.quantity === undefined) {
    errors.push('Quantity is required.');
  } else if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity < 1) {
    errors.push('Quantity must be an integer of 1 or greater.');
  } else if (data.quantity > 99) {
    errors.push('Maximum quantity per item is 99.');
  }

  return errors;
}

function validateAddToCartMiddleware(req, res, next) {
  const errors = validateAddToCartInput(req.body);
  if (errors.length > 0) {
    return ApiResponse.error(res, 'Invalid cart item payload', 400, errors, 'VALIDATION_ERROR');
  }
  next();
}

function validateUpdateQuantityMiddleware(req, res, next) {
  const errors = validateUpdateQuantityInput(req.body);
  if (errors.length > 0) {
    return ApiResponse.error(res, 'Invalid quantity update payload', 400, errors, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = {
  validateAddToCartInput,
  validateUpdateQuantityInput,
  validateAddToCartMiddleware,
  validateUpdateQuantityMiddleware
};
