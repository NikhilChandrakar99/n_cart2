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





  
  it('POST /api/orders - should reject an invalid customer email', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { ...customer, email: 'invalid-email' }
      });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('POST /api/orders - should reject a customer name shorter than 2 characters', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { ...customer, name: 'A' }
      });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('PATCH /api/orders/:id/status - should reject an invalid status transition', async () => {
    await request(app).post('/api/cart')
      .send({ productId: 'prod-001', quantity: 1 });

    const orderRes = await request(app)
      .post('/api/orders')
      .send({ customer });

    const orderId = orderRes.body.data.id;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'delivered' });

    expect(res.status).toBe(400);
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
});
