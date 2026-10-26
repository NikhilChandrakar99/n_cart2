/**
 * Cart Service
 * Manages shopping cart items, item enrichment, stock checks, and totals calculations.
 */

const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');
const { calculateCartTotals } = require('../utils/calculations');
const ProductService = require('./productService');

const CART_FILE = 'cart.json';

class CartService {
  /**
   * Retrieves current cart items and computed financial totals
   */
  static async getCart() {
    const rawItems = readJsonFile(CART_FILE, []);
    const totals = calculateCartTotals(rawItems);

    return {
      items: rawItems,
      ...totals
    };
  }

  /**
   * Adds an item to the shopping cart
   */
  static async addItem({ productId, quantity = 1, size = 'Standard', color = 'Default' }) {
    const product = await ProductService.getProductById(productId);
    if (!product) {
      const err = new Error(`Product with ID '${productId}' was not found.`);
      err.statusCode = 404;
      err.code = 'PRODUCT_NOT_FOUND';
      throw err;
    }

    const cart = readJsonFile(CART_FILE, []);

    // Check if the same product with the same size/color already exists in the cart
    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.size === size && item.color === color
    );

    const safeQty = Math.max(1, Math.min(99, quantity));

    if (existingIndex > -1) {
      const newQty = Math.min(99, cart[existingIndex].quantity + safeQty);
      cart[existingIndex].quantity = newQty;
      cart[existingIndex].subtotal = Math.round(cart[existingIndex].price * newQty * 100) / 100;
    } else {
      cart.push({
        id: `ci-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        color,
        quantity: safeQty,
        subtotal: Math.round(product.price * safeQty * 100) / 100
      });
    }

    writeJsonFile(CART_FILE, cart);
    return this.getCart();
  }

  /**
   * Updates an item's quantity in the cart
   */
  static async updateQuantity(productId, quantity, size = null) {
    const cart = readJsonFile(CART_FILE, []);
    const index = cart.findIndex(
      item => (item.productId === productId || item.id === productId) && (!size || item.size === size)
    );

    if (index === -1) {
      const err = new Error(`Item '${productId}' not found in cart.`);
      err.statusCode = 404;
      err.code = 'ITEM_NOT_IN_CART';
      throw err;
    }

    if (quantity <= 0) {
      // If quantity is 0 or less, remove item
      cart.splice(index, 1);
    } else {
      const safeQty = Math.min(99, quantity);
      cart[index].quantity = safeQty;
      cart[index].subtotal = Math.round(cart[index].price * safeQty * 100) / 100;
    }

    writeJsonFile(CART_FILE, cart);
    return this.getCart();
  }

  /**
   * Removes an item from the cart
   */
  static async removeItem(productId, size = null) {
    const cart = readJsonFile(CART_FILE, []);
    const filtered = cart.filter(
      item => !(
        (item.productId === productId || item.id === productId) &&
        (!size || item.size === size)
      )
    );

    writeJsonFile(CART_FILE, filtered);
    return this.getCart();
  }

  /**
   * Clears the shopping cart
   */
  static async clearCart() {
    writeJsonFile(CART_FILE, []);
    return this.getCart();
  }
}

module.exports = CartService;
