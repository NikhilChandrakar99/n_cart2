/**
 * Cart Controller
 */

const CartService = require('../services/cartService');
const ApiResponse = require('../utils/apiResponse');

class CartController {
  static async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart();
      return ApiResponse.success(res, cart, 'Shopping cart retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req, res, next) {
    try {
      const cart = await CartService.addItem(req.body);
      return ApiResponse.success(res, cart, 'Item added to shopping cart');
    } catch (err) {
      if (err.statusCode) {
        return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
      }
      next(err);
    }
  }

  static async updateQuantity(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity, size } = req.body;
      const cart = await CartService.updateQuantity(productId, quantity, size);
      return ApiResponse.success(res, cart, 'Cart item quantity updated');
    } catch (err) {
      if (err.statusCode) {
        return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
      }
      next(err);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const { size } = req.query;
      const cart = await CartService.removeItem(productId, size);
      return ApiResponse.success(res, cart, 'Item removed from shopping cart');
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart();
      return ApiResponse.success(res, cart, 'Shopping cart cleared');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CartController;
