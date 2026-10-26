const request = require('supertest');
const app = require('../../src/app');

describe('Product Management API Tests', () => {
  let createdProductId = null;

  it('GET /api/products - should return list of products with pagination', async () => {
    const res = await request(app).get('/api/products?page=1&limit=6');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.limit).toBe(6);
  });

  it('GET /api/products?category=watches - should filter by category', async () => {
    const res = await request(app).get('/api/products?category=watches');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach(p => {
      expect(p.category.toLowerCase()).toBe('watches');
    });
  });

  it('GET /api/products?q=torch - should search products by name or description', async () => {
    const res = await request(app).get('/api/products?q=torch');
    expect(res.status).toBe(200);
    expect(res.body.data.some(p => p.name.toLowerCase().includes('torch'))).toBe(true);
  });

  it('GET /api/products?sort=price-asc - should sort products by ascending price', async () => {
    const res = await request(app).get('/api/products?sort=price-asc&limit=10');
    expect(res.status).toBe(200);
    const prices = res.body.data.map(p => p.price);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  it('GET /api/products/featured - should return only featured items', async () => {
    const res = await request(app).get('/api/products/featured');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach(p => expect(p.featured).toBe(true));
  });

  it('GET /api/products/:id - should return single product details', async () => {
    const res = await request(app).get('/api/products/prod-001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('prod-001');
    expect(res.body.data.name).toBe('DNM Hammer Torch');
  });

  it('GET /api/products/:id - should return 404 for invalid ID', async () => {
    const res = await request(app).get('/api/products/non-existent-product-id');
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('PRODUCT_NOT_FOUND');
  });

  it('POST /api/products - should create a new product', async () => {
    const payload = {
      name: 'Integration Test Smart Band',
      price: 149.99,
      category: 'watches',
      stock: 25,
      description: 'A test product for integration testing'
    };

    const res = await request(app).post('/api/products').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.id).toBeDefined();
    createdProductId = res.body.data.id;
  });

  it('PUT /api/products/:id - should update product details', async () => {
    expect(createdProductId).toBeDefined();
    const update = { price: 129.99, stock: 30 };
    const res = await request(app).put(`/api/products/${createdProductId}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(129.99);
    expect(res.body.data.stock).toBe(30);
  });

  it('DELETE /api/products/:id - should delete product', async () => {
    expect(createdProductId).toBeDefined();
    const res = await request(app).delete(`/api/products/${createdProductId}`);
    expect(res.status).toBe(200);

    // Verify it is gone
    const check = await request(app).get(`/api/products/${createdProductId}`);
    expect(check.status).toBe(404);
  });
});
