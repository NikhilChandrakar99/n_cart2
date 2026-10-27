const request = require('supertest');
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
          quantity: 1
        }
      ]
    });

  expect(res.status).toBe(201);
  expect(res.body.data.financials.subtotal).toBe(240);
});


it('POST /api/orders - should not mark an order as paid for an invalid payment method', async () => {
  await request(app)
    .post('/api/cart')
    .send({ productId: 'prod-001', quantity: 1 });

  const res = await request(app)
    .post('/api/orders')
    .send({
      customer,
      paymentMethod: 'invalid_method'
    });

  expect(res.status).toBe(400);
  expect(res.body.errorCode).toBe('VALIDATION_ERROR');
});

it('PATCH /api/orders/:id/status - should reject reverting a delivered order to pending', async () => {
  await request(app)
    .post('/api/cart')
    .send({ productId: 'prod-001', quantity: 1 });

  const orderRes = await request(app)
    .post('/api/orders')
    .send({ customer });

  const orderId = orderRes.body.data.id;

  const deliveredRes = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .send({ status: 'delivered' });

  expect(deliveredRes.status).toBe(200);

  const revertRes = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .send({ status: 'pending' });

  expect(revertRes.status).toBe(400);
  expect(revertRes.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
});

it('PATCH /api/orders/:id/status - should reject transitioning a cancelled order to shipped', async () => {
  await request(app)
    .post('/api/cart')
    .send({ productId: 'prod-001', quantity: 1 });

  const orderRes = await request(app)
    .post('/api/orders')
    .send({ customer });

  const orderId = orderRes.body.data.id;

  const cancelledRes = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .send({ status: 'cancelled' });

  expect(cancelledRes.status).toBe(200);

  const transitionRes = await request(app)
    .patch(`/api/orders/${orderId}/status`)
    .send({ status: 'shipped' });

  expect(transitionRes.status).toBe(400);
  expect(transitionRes.body.errorCode).toBe('INVALID_STATUS_TRANSITION');
});
});
