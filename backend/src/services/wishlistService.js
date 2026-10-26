/**
 * Wishlist Service
 * Handles user wishlist storage, prevents duplicate entries, and manages items.
 */

const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');
const ProductService = require('./productService');

const WISHLIST_FILE = 'wishlist.json';

class WishlistService {
  /**
   * Retrieves all items in the wishlist with populated product details
   */
  static async getWishlist() {
    return readJsonFile(WISHLIST_FILE, []);
  }

  /**
   * Adds a product to the wishlist (avoids duplicates)
   */
  static async addItem(productId) {
    const product = await ProductService.getProductById(productId);
    if (!product) {
      const err = new Error(`Product with ID '${productId}' was not found.`);
      err.statusCode = 404;
      err.code = 'PRODUCT_NOT_FOUND';
      throw err;
    }

    const wishlist = readJsonFile(WISHLIST_FILE, []);
    const existing = wishlist.find(item => item.productId === product.id);

    if (existing) {
      const err = new Error(`Product '${product.name}' is already in your wishlist.`);
      err.statusCode = 409;
      err.code = 'DUPLICATE_WISHLIST_ITEM';
      throw err;
    }

    const item = {
      id: `wsh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      addedAt: new Date().toISOString()
    };

    wishlist.push(item);
    writeJsonFile(WISHLIST_FILE, wishlist);
    return item;
  }

  /**
   * Removes a product from the wishlist
   */
  static async removeItem(productId) {
    const wishlist = readJsonFile(WISHLIST_FILE, []);
    const initialLen = wishlist.length;
    const filtered = wishlist.filter(item => item.productId !== productId && item.id !== productId);

    if (filtered.length === initialLen) {
      const err = new Error(`Item '${productId}' not found in wishlist.`);
      err.statusCode = 404;
      err.code = 'WISHLIST_ITEM_NOT_FOUND';
      throw err;
    }

    writeJsonFile(WISHLIST_FILE, filtered);
    return filtered;
  }

  /**
   * Clears the entire wishlist
   */
  static async clearWishlist() {
    writeJsonFile(WISHLIST_FILE, []);
    return [];
  }
}

module.exports = WishlistService;
