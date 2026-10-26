const request = require('supertest');
const app = require('../../src/app');

describe('Health and Security API Tests', () => {
  it('GET /api/health - should return 200 with service health data', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toContain('N_cart');
    expect(typeof res.body.data.uptimeSeconds).toBe('number');
  });

  it('GET /api/nonexistent-endpoint - should return 404 with standard error contract', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('ROUTE_NOT_FOUND');
  });

  it('POST /api/products with malformed JSON - should return 400 INVALID_JSON', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send('{ "invalidJson": true, ');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('INVALID_JSON');
  });

  it('Should include standard security headers via Helmet', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
