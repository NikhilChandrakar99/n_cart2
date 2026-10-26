const request = require('supertest');
const app = require('../../src/app');

describe('Shopping Cart API Tests', () => {
  beforeEach(async () => {
    // Clear cart before each test for predictable test state
    await request(app).delete('/api/cart');
  });

  it('GET /api/cart - should return empty cart initially', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.itemCount).toBe(0);
    expect(res.body.data.total).toBe(0);
  });

  it('POST /api/cart - should add a valid product to cart and compute totals', async () => {
    const res = await request(app).post('/api/cart').send({
      productId: 'prod-001',
      quantity: 2,
      size: 'Standard'
    });

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.itemCount).toBe(2);
    expect(res.body.data.subtotal).toBe(480.00); // 240 * 2
    expect(res.body.data.shipping).toBe(0); // 480 >= 150 free shipping
    expect(res.body.data.total).toBeGreaterThan(480);
  });

  it('POST /api/cart - should return 404 for non-existent product ID', async () => {
    const res = await request(app).post('/api/cart').send({
      productId: 'non-existent-prod',
      quantity: 1
    });

    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('PRODUCT_NOT_FOUND');
  });

  it('POST /api/cart - should return 400 for negative or invalid quantity', async () => {
    const res = await request(app).post('/api/cart').send({
      productId: 'prod-001',
      quantity: -5
    });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/cart/items/:productId - should update item quantity', async () => {
    // First add item
    await request(app).post('/api/cart').send({
      productId: 'prod-001',
      quantity: 1
    });

    // Then update quantity to 3
    const res = await request(app)
      .put('/api/cart/items/prod-001')
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.itemCount).toBe(3);
    expect(res.body.data.subtotal).toBe(720.00); // 240 * 3
  });

  it('DELETE /api/cart/items/:productId - should remove item from cart', async () => {
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });
    await request(app).post('/api/cart').send({ productId: 'prod-002', quantity: 1 });

    const deleteRes = await request(app).delete('/api/cart/items/prod-001');
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.items.some(i => i.productId === 'prod-001')).toBe(false);
    expect(deleteRes.body.data.items.some(i => i.productId === 'prod-002')).toBe(true);
  });

  it('DELETE /api/cart - should clear the entire shopping cart', async () => {
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 2 });
    const res = await request(app).delete('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });
});
