const { validateProductInput } = require('../../src/validators/productValidator');
const { validateAddToCartInput, validateUpdateQuantityInput } = require('../../src/validators/cartValidator');
const { validateOrderInput, validateOrderStatusInput } = require('../../src/validators/orderValidator');
const { validateContactInput } = require('../../src/validators/contactValidator');

describe('Input Validators Unit Tests', () => {
  describe('Product Validator', () => {
    it('should validate a correct product payload', () => {
      const valid = { name: 'Running Shoes', price: 99.99, category: 'shoes' };
      expect(validateProductInput(valid)).toHaveLength(0);
    });

    it('should reject missing or short product names', () => {
      const invalid = { name: 'A', price: 50, category: 'shoes' };
      const errors = validateProductInput(invalid);
      expect(errors.some(e => e.includes('Product name'))).toBe(true);
    });

    it('should reject invalid or negative prices', () => {
      const invalid = { name: 'Running Shoes', price: -10, category: 'shoes' };
      const errors = validateProductInput(invalid);
      expect(errors.some(e => e.includes('Price must be a valid positive number'))).toBe(true);
    });
  });

  describe('Cart Validator', () => {
    it('should validate a correct add-to-cart payload', () => {
      const valid = { productId: 'prod-001', quantity: 2 };
      expect(validateAddToCartInput(valid)).toHaveLength(0);
    });

    it('should reject empty or missing productId', () => {
      const invalid = { productId: '  ', quantity: 1 };
      const errors = validateAddToCartInput(invalid);
      expect(errors.some(e => e.includes('productId is required'))).toBe(true);
    });

    it('should reject non-positive or non-integer quantities', () => {
      expect(validateAddToCartInput({ productId: 'prod-001', quantity: 0 })).toHaveLength(1);
      expect(validateAddToCartInput({ productId: 'prod-001', quantity: -3 })).toHaveLength(1);
      expect(validateAddToCartInput({ productId: 'prod-001', quantity: 2.5 })).toHaveLength(1);
    });

    it('should reject quantity exceeding maximum limit (99)', () => {
      expect(validateAddToCartInput({ productId: 'prod-001', quantity: 150 })).toHaveLength(1);
    });
  });

  describe('Order Validator', () => {
    const validCustomer = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      address: '123 Baker Street',
      city: 'London',
      postalCode: 'NW1 6XE'
    };

    it('should validate complete customer order data', () => {
      expect(validateOrderInput({ customer: validCustomer })).toHaveLength(0);
    });

    it('should reject missing or malformed email', () => {
      const invalid = { customer: { ...validCustomer, email: 'not-an-email' } };
      const errors = validateOrderInput(invalid);
      expect(errors.some(e => e.includes('Valid customer email'))).toBe(true);
    });

    it('should validate allowed order status transitions', () => {
      expect(validateOrderStatusInput({ status: 'shipped' })).toHaveLength(0);
      expect(validateOrderStatusInput({ status: 'invalid_status' })).toHaveLength(1);
    });
  });

  describe('Contact Validator', () => {
    it('should validate a proper contact submission', () => {
      const valid = {
        name: 'John Smith',
        email: 'john@example.com',
        subject: 'General Inquiry',
        message: 'Hello, I have a question regarding shipping times.'
      };
      expect(validateContactInput(valid)).toHaveLength(0);
    });

    it('should reject too short messages (< 10 chars)', () => {
      const invalid = {
        name: 'John',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hi'
      };
      const errors = validateContactInput(invalid);
      expect(errors.some(e => e.includes('Message is required and must be at least 10'))).toBe(true);
    });
  });
});
