const request = require('supertest');
const app = require('../../src/app');

describe('Category API Tests', () => {
  it('GET /api/categories - should return list of categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.some(c => c.slug === 'watches')).toBe(true);
  });

  it('GET /api/categories/:id - should return single category details', async () => {
    const res = await request(app).get('/api/categories/watches');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Watches');
  });

  it('GET /api/categories/:id/products - should return products for category', async () => {
    const res = await request(app).get('/api/categories/watches/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/categories - should create category and reject duplicate slug', async () => {
    const newCat = { name: 'E-Books & Media', description: 'Digital content' };
    const res = await request(app).post('/api/categories').send(newCat);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(newCat.name);

    // Duplicate test
    const dupRes = await request(app).post('/api/categories').send(newCat);
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.errorCode).toBe('CATEGORY_ALREADY_EXISTS');

    // Clean up
    await request(app).delete(`/api/categories/${res.body.data.id}`);
  });
});
