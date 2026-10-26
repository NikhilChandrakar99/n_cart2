/**
 * Product Service
 * Handles business logic, filtering, search, sorting, and pagination for products.
 */

const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');

const PRODUCTS_FILE = 'products.json';

class ProductService {
  /**
   * Retrieves products with filtering, search, sorting, and pagination.
   */
  static async getProducts(query = {}) {
    const products = readJsonFile(PRODUCTS_FILE, []);
    let filtered = [...products];

    // Search query filter (matches name, description, category)
    if (query.q && typeof query.q === 'string' && query.q.trim()) {
      const searchTerm = query.q.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchTerm)) ||
        (p.description && p.description.toLowerCase().includes(searchTerm)) ||
        (p.category && p.category.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (query.category && typeof query.category === 'string' && query.category.trim() && query.category.toLowerCase() !== 'all') {
      const cat = query.category.trim().toLowerCase();
      filtered = filtered.filter(p => p.category && p.category.toLowerCase() === cat);
    }

    // Featured filter
    if (query.featured !== undefined) {
      const isFeatured = query.featured === 'true' || query.featured === true;
      filtered = filtered.filter(p => Boolean(p.featured) === isFeatured);
    }

    // Sorting (supports both price-asc and price_asc)
    const sort = (query.sort || 'featured').toLowerCase().replace('_', '-');
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    // Pagination
    const totalItems = filtered.length;
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '12', 10)));
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Find product by ID
   */
  static async getProductById(id) {
    if (!id) return null;
    const products = readJsonFile(PRODUCTS_FILE, []);
    return products.find(p => p.id === id || p.slug === id) || null;
  }

  /**
   * Create a new product
   */
  static async createProduct(data) {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const newId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProduct = {
      id: newId,
      name: data.name.trim(),
      slug: data.slug || `${slug}-${newId.slice(-4)}`,
      price: data.price,
      category: data.category.toLowerCase().trim(),
      rating: data.rating || 0,
      reviews: data.reviews || 0,
      featured: Boolean(data.featured),
      inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
      stock: data.stock !== undefined ? data.stock : 10,
      image: data.image || 'assets/img/shop_01.jpg',
      images: Array.isArray(data.images) && data.images.length ? data.images : [data.image || 'assets/img/shop_01.jpg'],
      description: data.description || '',
      sizes: Array.isArray(data.sizes) ? data.sizes : ['Standard'],
      colors: Array.isArray(data.colors) ? data.colors : ['Default'],
      specifications: Array.isArray(data.specifications) ? data.specifications : [],
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    writeJsonFile(PRODUCTS_FILE, products);
    return newProduct;
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id, updateData) {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const index = products.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) {
      return null;
    }

    const existing = products[index];
    const updated = {
      ...existing,
      ...updateData,
      id: existing.id, // prevent ID change
      updatedAt: new Date().toISOString()
    };

    products[index] = updated;
    writeJsonFile(PRODUCTS_FILE, products);
    return updated;
  }

  /**
   * Delete product by ID
   */
  static async deleteProduct(id) {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const index = products.findIndex(p => p.id === id || p.slug === id);
    if (index === -1) {
      return false;
    }

    products.splice(index, 1);
    writeJsonFile(PRODUCTS_FILE, products);
    return true;
  }
}

module.exports = ProductService;
