/**
 * Product Request Validator
 */

const ApiResponse = require('../utils/apiResponse');

function validateProductInput(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Product name is required and must be at least 2 characters.');
    } else if (data.name.trim().length > 120) {
      errors.push('Product name cannot exceed 120 characters.');
    }
  }

  if (!isUpdate || data.price !== undefined) {
    if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
      errors.push('Price must be a valid positive number greater than 0.');
    }
  }

  if (!isUpdate || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
      errors.push('Category is required.');
    }
  }

  if (data.stock !== undefined) {
    if (typeof data.stock !== 'number' || isNaN(data.stock) || data.stock < 0 || !Number.isInteger(data.stock)) {
      errors.push('Stock must be a non-negative integer.');
    }
  }

  if (data.rating !== undefined) {
    if (typeof data.rating !== 'number' || isNaN(data.rating) || data.rating < 0 || data.rating > 5) {
      errors.push('Rating must be a number between 0 and 5.');
    }
  }

  return errors;
}

function validateProductMiddleware(req, res, next) {
  const errors = validateProductInput(req.body, req.method === 'PUT');
  if (errors.length > 0) {
    return ApiResponse.error(res, 'Validation failed for product payload', 400, errors, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = {
  validateProductInput,
  validateProductMiddleware
};
