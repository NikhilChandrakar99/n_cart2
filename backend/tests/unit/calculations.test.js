const { roundCurrency, calculateCartTotals } = require('../../src/utils/calculations');

describe('Pricing and Cart Calculations Utility', () => {
  describe('roundCurrency', () => {
    it('should round numbers to 2 decimal places accurately', () => {
      expect(roundCurrency(10.555)).toBe(10.56);
      expect(roundCurrency(10.554)).toBe(10.55);
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
    });

    it('should handle zero, negatives, and invalid values gracefully', () => {
      expect(roundCurrency(0)).toBe(0);
      expect(roundCurrency(-5.555)).toBe(-5.55);
      expect(roundCurrency(NaN)).toBe(0);
      expect(roundCurrency(null)).toBe(0);
      expect(roundCurrency('not-a-number')).toBe(0);
    });
  });

  describe('calculateCartTotals', () => {
    it('should return zero totals for an empty items array', () => {
      const totals = calculateCartTotals([]);
      expect(totals).toEqual({
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0
      });
    });

    it('should apply flat shipping when subtotal is below threshold ($150)', () => {
      const items = [{ price: 50, quantity: 2 }]; // subtotal = 100
      const totals = calculateCartTotals(items, {
        taxRate: 0.1,
        shippingFlatRate: 15,
        freeShippingThreshold: 150
      });

      expect(totals.itemCount).toBe(2);
      expect(totals.subtotal).toBe(100);
      expect(totals.shipping).toBe(15);
      expect(totals.tax).toBe(10); // 10% of 100
      expect(totals.total).toBe(125); // 100 + 15 + 10
    });

    it('should waive shipping when subtotal meets or exceeds threshold ($150)', () => {
      const items = [{ price: 80, quantity: 2 }]; // subtotal = 160
      const totals = calculateCartTotals(items, {
        taxRate: 0.08,
        shippingFlatRate: 15,
        freeShippingThreshold: 150
      });

      expect(totals.subtotal).toBe(160);
      expect(totals.shipping).toBe(0);
      expect(totals.tax).toBe(12.8); // 8% of 160
      expect(totals.total).toBe(172.8);
    });

    it('should apply discount and compute tax on the discounted subtotal', () => {
      const items = [{ price: 100, quantity: 2 }]; // subtotal = 200
      const totals = calculateCartTotals(items, {
        taxRate: 0.08,
        discount: 50,
        freeShippingThreshold: 150
      });

      expect(totals.subtotal).toBe(200);
      expect(totals.discount).toBe(50);
      expect(totals.shipping).toBe(0); // 200 >= 150
      expect(totals.tax).toBe(12.0); // 8% of (200 - 50) = 12.0
      expect(totals.total).toBe(162.0); // 150 + 12
    });

    it('should cap discount so it never exceeds subtotal', () => {
      const items = [{ price: 30, quantity: 1 }]; // subtotal = 30
      const totals = calculateCartTotals(items, {
        taxRate: 0.1,
        discount: 100, // exceeds subtotal
        shippingFlatRate: 10,
        freeShippingThreshold: 150
      });

      expect(totals.subtotal).toBe(30);
      expect(totals.discount).toBe(30);
      expect(totals.tax).toBe(0);
      expect(totals.shipping).toBe(10);
      expect(totals.total).toBe(10);
    });

    it('should throw TypeError if items is not an array', () => {
      expect(() => calculateCartTotals(null)).toThrow(TypeError);
      expect(() => calculateCartTotals('invalid')).toThrow(TypeError);
    });
  });
});
