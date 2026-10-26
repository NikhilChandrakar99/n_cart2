/**
 * Category Controller
 */

const CategoryService = require('../services/categoryService');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getCategories();
      return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryByIdOrSlug(id);
      if (!category) {
        return ApiResponse.error(res, `Category '${id}' was not found.`, 404, null, 'CATEGORY_NOT_FOUND');
      }
      return ApiResponse.success(res, category, 'Category details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getProductsByCategory(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CategoryService.getProductsByCategory(id, req.query);
      if (!result) {
        return ApiResponse.error(res, `Category '${id}' was not found.`, 404, null, 'CATEGORY_NOT_FOUND');
      }
      return ApiResponse.success(res, result.items, `Products for category '${id}'`, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return ApiResponse.error(res, 'Category name must be at least 2 characters.', 400, null, 'VALIDATION_ERROR');
      }
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.created(res, category, 'Category created successfully');
    } catch (err) {
      if (err.message.includes('already exists')) {
        return ApiResponse.error(res, err.message, 409, null, 'CATEGORY_ALREADY_EXISTS');
      }
      next(err);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await CategoryService.updateCategory(id, req.body);
      if (!updated) {
        return ApiResponse.error(res, `Category '${id}' was not found.`, 404, null, 'CATEGORY_NOT_FOUND');
      }
      return ApiResponse.success(res, updated, 'Category updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await CategoryService.deleteCategory(id);
      if (!deleted) {
        return ApiResponse.error(res, `Category '${id}' was not found.`, 404, null, 'CATEGORY_NOT_FOUND');
      }
      return ApiResponse.success(res, { id }, 'Category deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CategoryController;
