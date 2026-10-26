/**
 * Pricing and Cart Calculations Utility
 * Handles financial calculations, discounts, shipping, and tax rounding.
 */

const config = require('../config');

/**
 * Rounds a number to exactly two decimal places.
 * Avoids JavaScript floating point inaccuracies (e.g., 0.1 + 0.2 = 0.30000000000000004).
 * @param {number} value
 * @returns {number}
 */
function roundCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates cart totals including subtotal, tax, shipping, discount, and grand total.
 * @param {Array<{ price: number, quantity: number }>} items - Cart items
 * @param {Object} options - Calculation options (custom taxRate, couponDiscount, etc.)
 * @returns {{ itemCount: number, subtotal: number, tax: number, shipping: number, discount: number, total: number }}
 */
function calculateCartTotals(items = [], options = {}) {
  if (!Array.isArray(items)) {
    throw new TypeError('Items must be an array');
  }

  const taxRate = typeof options.taxRate === 'number' ? options.taxRate : config.taxRate;
  const freeShippingThreshold = typeof options.freeShippingThreshold === 'number' ? options.freeShippingThreshold : config.freeShippingThreshold;
  const shippingFlatRate = typeof options.shippingFlatRate === 'number' ? options.shippingFlatRate : config.shippingFlatRate;
  const rawDiscount = typeof options.discount === 'number' ? Math.max(0, options.discount) : 0;

  let subtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    const price = typeof item.price === 'number' && item.price >= 0 ? item.price : 0;
    const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? Math.floor(item.quantity) : 0;
    subtotal += price * quantity;
    itemCount += quantity;
  }

  subtotal = roundCurrency(subtotal);

  // Apply discount (capped at subtotal)
  const discount = roundCurrency(Math.min(subtotal, rawDiscount));
  const discountedSubtotal = Math.max(0, subtotal - discount);

  // Shipping calculation (free if subtotal meets threshold or cart is empty)
  let shipping = 0;
  if (itemCount > 0) {
    shipping = subtotal >= freeShippingThreshold ? 0 : shippingFlatRate;
  }
  shipping = roundCurrency(shipping);

  // Tax calculation applied on taxable subtotal
  const tax = roundCurrency(discountedSubtotal * taxRate);

  // Grand total
  const total = roundCurrency(discountedSubtotal + tax + shipping);

  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    tax,
    total
  };
}

module.exports = {
  roundCurrency,
  calculateCartTotals
};
