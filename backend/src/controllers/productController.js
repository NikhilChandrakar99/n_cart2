/**
 * Product Controller
 * Handles HTTP requests for product catalog, search, filtering, and CRUD.
 */

const ProductService = require('../services/productService');
const ApiResponse = require('../utils/apiResponse');

class ProductController {
  static async getProducts(req, res, next) {
    try {
      const result = await ProductService.getProducts(req.query);
      return ApiResponse.success(res, result.items, 'Products retrieved successfully', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getFeaturedProducts(req, res, next) {
    try {
      const result = await ProductService.getProducts({ featured: true, limit: 6 });
      return ApiResponse.success(res, result.items, 'Featured products retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      if (!product) {
        return ApiResponse.error(res, `Product with ID '${id}' was not found.`, 404, null, 'PRODUCT_NOT_FOUND');
      }
      return ApiResponse.success(res, product, 'Product details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async searchProducts(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) {
        return ApiResponse.error(res, 'Query parameter "q" is required for search.', 400, null, 'MISSING_SEARCH_QUERY');
      }
      const result = await ProductService.getProducts({ q, limit: 20 });
      return ApiResponse.success(res, result.items, `Search results for "${q}"`, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await ProductService.updateProduct(id, req.body);
      if (!updated) {
        return ApiResponse.error(res, `Product with ID '${id}' was not found.`, 404, null, 'PRODUCT_NOT_FOUND');
      }
      return ApiResponse.success(res, updated, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.deleteProduct(id);
      if (!deleted) {
        return ApiResponse.error(res, `Product with ID '${id}' was not found.`, 404, null, 'PRODUCT_NOT_FOUND');
      }
      return ApiResponse.success(res, { id }, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
