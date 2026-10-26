/**
 * Category Service
 */

const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');
const ProductService = require('./productService');

const CATEGORIES_FILE = 'categories.json';

class CategoryService {
  static async getCategories() {
    return readJsonFile(CATEGORIES_FILE, []);
  }

  static async getCategoryByIdOrSlug(identifier) {
    if (!identifier) return null;
    const categories = readJsonFile(CATEGORIES_FILE, []);
    return categories.find(c => c.id === identifier || c.slug === identifier.toLowerCase()) || null;
  }

  static async getProductsByCategory(slugOrId, query = {}) {
    const category = await this.getCategoryByIdOrSlug(slugOrId);
    if (!category) return null;

    return ProductService.getProducts({
      ...query,
      category: category.slug
    });
  }

  static async createCategory(data) {
    const categories = readJsonFile(CATEGORIES_FILE, []);
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = categories.find(c => c.slug === slug);
    if (existing) {
      throw new Error(`Category with slug '${slug}' already exists.`);
    }

    const newCategory = {
      id: `cat-${slug}`,
      name: data.name.trim(),
      slug,
      description: data.description || '',
      image: data.image || 'assets/img/category_img_01.jpg',
      itemCount: 0
    };

    categories.push(newCategory);
    writeJsonFile(CATEGORIES_FILE, categories);
    return newCategory;
  }

  static async updateCategory(id, data) {
    const categories = readJsonFile(CATEGORIES_FILE, []);
    const index = categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) return null;

    const existing = categories[index];
    const updated = {
      ...existing,
      ...data,
      id: existing.id // protect id
    };

    categories[index] = updated;
    writeJsonFile(CATEGORIES_FILE, categories);
    return updated;
  }

  static async deleteCategory(id) {
    const categories = readJsonFile(CATEGORIES_FILE, []);
    const index = categories.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) return false;

    categories.splice(index, 1);
    writeJsonFile(CATEGORIES_FILE, categories);
    return true;
  }
}

module.exports = CategoryService;
