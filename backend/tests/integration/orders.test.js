const request = require('supertest');
const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('../../src/config');
const app = require('../../src/app');

describe('Order Management API Tests', () => {
  const customer = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555-0199',
    address: '456 Elm Street',
    city: 'Seattle',
    postalCode: '98101'
  };

  const originalDataDir = config.dataDir;
  let testDataDir;

  beforeAll(() => {
    testDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ncart-orders-'));
    fs.copyFileSync(path.join(originalDataDir, 'products.json'), path.join(testDataDir, 'products.json'));
    config.dataDir = testDataDir;
  });

  afterAll(() => {
    config.dataDir = originalDataDir;
    if (testDataDir) fs.rmSync(testDataDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await request(app).delete('/api/cart');
  });

  it('POST /api/orders - should reject order creation when cart is empty', async () => {
    const res = await request(app).post('/api/orders').send({ customer });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('EMPTY_CART');
  });

  it('POST /api/orders - should create order from active cart and clear cart', async () => {
    // Add item to cart
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });

    // Place order
    const res = await request(app).post('/api/orders').send({
      customer,
      paymentMethod: 'cod',
      notes: 'Leave at front door'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{4}$/);
    expect(res.body.data.customer.email).toBe(customer.email);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.paymentStatus).toBe('pending_payment');
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.financials.subtotal).toBe(240.00);

    // Verify cart was cleared
    const cartRes = await request(app).get('/api/cart');
    expect(cartRes.body.data.items).toHaveLength(0);
  });

  it('GET /api/orders/:id - should fetch order details by order ID', async () => {
    // Add item and place order
    await request(app).post('/api/cart').send({ productId: 'prod-002', quantity: 1 });
    const orderRes = await request(app).post('/api/orders').send({ customer });
    const orderId = orderRes.body.data.id;

    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it('PATCH /api/orders/:id/status - should update status through controlled endpoint', async () => {
    // Create an order
    await request(app).post('/api/cart').send({ productId: 'prod-003', quantity: 1 });
    const orderRes = await request(app).post('/api/orders').send({ customer });
    const orderId = orderRes.body.data.id;

    // Transition to processing
    const updateRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'processing', note: 'Payment verified and packing started.' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('processing');
    expect(updateRes.body.data.statusHistory.length).toBeGreaterThanOrEqual(2);
  });

  it('PATCH /api/orders/:id/status - should reject invalid order status', async () => {
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });
    const orderRes = await request(app).post('/api/orders').send({ customer });
    const orderId = orderRes.body.data.id;

    const invalidRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'teleported' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.errorCode).toBe('VALIDATION_ERROR');
  });
  it('POST /api/orders - should not trust client-supplied product prices', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer,
        paymentMethod: 'cod',
        items: [
          {
            productId: 'prod-001',
            name: 'Test Product',
            price: 1,
            subtotal: 1,
            quantity: 1
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.financials.subtotal).toBe(240);
    expect(res.body.data.items[0]).toMatchObject({
      productId: 'prod-001', name: 'DNM Hammer Torch', price: 240, subtotal: 240
    });
    const saved = await request(app).get(`/api/orders/${res.body.data.id}`);
    expect(saved.body.data).toEqual(res.body.data);
  });

  it('POST /api/orders - should reject products missing from the catalog', async () => {
    const before = await request(app).get('/api/orders');
    const res = await request(app).post('/api/orders').send({
      customer,
      items: [{ productId: 'missing-product', price: 1, quantity: 1 }]
    });

    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('PRODUCT_NOT_FOUND');
    const after = await request(app).get('/api/orders');
    expect(after.body.data).toEqual(before.body.data);
  });

  it.each(['invalid_method', '', null, 42])(
    'POST /api/orders - should reject unsupported payment method %p without creating an order',
    async paymentMethod => {
      await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });
      const before = await request(app).get('/api/orders');
      const cartBefore = await request(app).get('/api/cart');

      const res = await request(app).post('/api/orders').send({ customer, paymentMethod });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
      const after = await request(app).get('/api/orders');
      expect(after.body.data).toEqual(before.body.data);
      const cartAfter = await request(app).get('/api/cart');
      expect(cartAfter.body.data).toEqual(cartBefore.body.data);
    }
  );

  it.each(['card', 'upi'])(
    'POST /api/orders - should leave unverified %s payments pending',
    async paymentMethod => {
      const res = await request(app).post('/api/orders').send({
        customer,
        paymentMethod,
        paymentStatus: 'paid',
        paymentVerified: true,
        items: [{ productId: 'prod-001', price: 1, quantity: 1 }]
      });

      expect(res.status).toBe(201);
      expect(res.body.data.paymentMethod).toBe(paymentMethod);
      expect(res.body.data.paymentStatus).toBe('pending_payment');
    }
  );

  it('PATCH /api/orders/:id/status - should reject reverting a delivered order to pending', async () => {
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });
    const orderRes = await request(app).post('/api/orders').send({ customer });
    const orderId = orderRes.body.data.id;

    let deliveredOrder;
    for (const status of ['processing', 'shipped', 'delivered']) {
      const res = await request(app).patch(`/api/orders/${orderId}/status`).send({ status });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(status);
      deliveredOrder = res.body.data;
    }

    const revertRes = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'pending' });

    expect(revertRes.status).toBe(400);
    expect(revertRes.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
    const saved = await request(app).get(`/api/orders/${orderId}`);
    expect(saved.body.data).toEqual(deliveredOrder);
  });

  it('PATCH /api/orders/:id/status - should reject skipping processing', async () => {
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });
    const orderRes = await request(app).post('/api/orders').send({ customer });
    const orderId = orderRes.body.data.id;

    const res = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'shipped' });

    expect(res.status).toBe(400);
    const saved = await request(app).get(`/api/orders/${orderId}`);
    expect(saved.body.data).toEqual(orderRes.body.data);
  });

  it('PATCH /api/orders/:id/status - should allow cancellation and reject reopening a cancelled order', async () => {
    await request(app).post('/api/cart').send({ productId: 'prod-001', quantity: 1 });
    const orderRes = await request(app).post('/api/orders').send({ customer });
    const orderId = orderRes.body.data.id;
    const cancelled = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'cancelled' });
    expect(cancelled.status).toBe(200);

    const reopen = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'processing' });
    expect(reopen.status).toBe(400);
    const saved = await request(app).get(`/api/orders/${orderId}`);
    expect(saved.body.data).toEqual(cancelled.body.data);
  });
});
