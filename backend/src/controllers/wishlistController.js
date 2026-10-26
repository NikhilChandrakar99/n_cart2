/**
 * Wishlist Controller
 */

const WishlistService = require('../services/wishlistService');
const ApiResponse = require('../utils/apiResponse');

class WishlistController {
  static async getWishlist(req, res, next) {
    try {
      const items = await WishlistService.getWishlist();
      return ApiResponse.success(res, items, 'Wishlist retrieved successfully', 200, { itemCount: items.length });
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId || typeof productId !== 'string') {
        return ApiResponse.error(res, 'productId is required.', 400, null, 'VALIDATION_ERROR');
      }
      const item = await WishlistService.addItem(productId);
      return ApiResponse.created(res, item, 'Item added to wishlist');
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
      const items = await WishlistService.removeItem(productId);
      return ApiResponse.success(res, items, 'Item removed from wishlist');
    } catch (err) {
      if (err.statusCode) {
        return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
      }
      next(err);
    }
  }

  static async clearWishlist(req, res, next) {
    try {
      const items = await WishlistService.clearWishlist();
      return ApiResponse.success(res, items, 'Wishlist cleared');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WishlistController;
