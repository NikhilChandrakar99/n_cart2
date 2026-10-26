const request = require('supertest');
const app = require('../../src/app');

describe('Wishlist API Tests', () => {
  beforeEach(async () => {
    await request(app).delete('/api/wishlist');
  });

  it('GET /api/wishlist - should return empty list initially', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('POST /api/wishlist - should add product to wishlist', async () => {
    const res = await request(app).post('/api/wishlist').send({ productId: 'prod-001' });
    expect(res.status).toBe(201);
    expect(res.body.data.productId).toBe('prod-001');
    expect(res.body.data.name).toBe('DNM Hammer Torch');
  });

  it('POST /api/wishlist - should reject duplicate entries with 409', async () => {
    await request(app).post('/api/wishlist').send({ productId: 'prod-001' });

    const dupRes = await request(app).post('/api/wishlist').send({ productId: 'prod-001' });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.errorCode).toBe('DUPLICATE_WISHLIST_ITEM');
  });

  it('DELETE /api/wishlist/:productId - should remove item from wishlist', async () => {
    await request(app).post('/api/wishlist').send({ productId: 'prod-002' });

    const delRes = await request(app).delete('/api/wishlist/prod-002');
    expect(delRes.status).toBe(200);

    const getRes = await request(app).get('/api/wishlist');
    expect(getRes.body.data.some(i => i.productId === 'prod-002')).toBe(false);
  });
});
