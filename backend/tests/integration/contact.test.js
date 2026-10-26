const request = require('supertest');
const app = require('../../src/app');

describe('Contact API Tests', () => {
  it('POST /api/contact - should accept valid contact submission', async () => {
    const payload = {
      name: 'Robert Miller',
      email: 'robert@example.com',
      subject: 'Inquiry on Bulk Purchase',
      message: 'Hello, do you offer discount tiers for corporate bulk purchases?'
    };

    const res = await request(app).post('/api/contact').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^msg-/);
  });

  it('POST /api/contact - should reject invalid email format', async () => {
    const payload = {
      name: 'Robert Miller',
      email: 'invalid-email-string',
      subject: 'General Question',
      message: 'This is a test message to verify email validation.'
    };

    const res = await request(app).post('/api/contact').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    expect(res.body.errors.some(e => e.includes('Valid email'))).toBe(true);
  });

  it('POST /api/contact - should reject missing message or message shorter than 10 chars', async () => {
    const payload = {
      name: 'Robert',
      email: 'robert@example.com',
      subject: 'Hi',
      message: 'Short'
    };

    const res = await request(app).post('/api/contact').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('GET /api/contact - should list submissions', async () => {
    const res = await request(app).get('/api/contact');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
