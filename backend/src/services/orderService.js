/**
 * Order Service
 * Handles order creation, unique order ID generation, status transitions, and retrieval.
 */

const { readJsonFile, writeJsonFile } = require('../utils/fileStorage');
const { calculateCartTotals, roundCurrency } = require('../utils/calculations');
const CartService = require('./cartService');
const ProductService = require('./productService');

const ORDERS_FILE = 'orders.json';
const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

class OrderService {
  /**
   * Generates a unique, human-readable Order Reference ID
   * Example: ORD-20261027-A8B9
   */
  static generateOrderId() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${dateStr}-${randPart}`;
  }

  /**
   * Retrieves all orders, optionally filtered by customer email
   */
  static async getOrders(query = {}) {
    const orders = readJsonFile(ORDERS_FILE, []);
    let filtered = [...orders];

    if (query.email) {
      const email = query.email.trim().toLowerCase();
      filtered = filtered.filter(o => o.customer && o.customer.email.toLowerCase() === email);
    }

    if (query.status) {
      filtered = filtered.filter(o => o.status === query.status.toLowerCase());
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return filtered;
  }

  /**
   * Retrieves a single order by its ID
   */
  static async getOrderById(id) {
    if (!id) return null;
    const orders = readJsonFile(ORDERS_FILE, []);
    return orders.find(o => o.id === id || o.orderNumber === id) || null;
  }

  /**
   * Creates an order from cart items or directly supplied items
   */
  static async createOrder(orderPayload) {
    const { customer, items: directItems, paymentMethod = 'cod', notes = '' } = orderPayload;

    let itemsToOrder = directItems;
    let createdFromCart = false;

    // If no direct items provided, use items from active cart
    if (!itemsToOrder || !Array.isArray(itemsToOrder) || itemsToOrder.length === 0) {
      const cart = await CartService.getCart();
      if (!cart.items || cart.items.length === 0) {
        const err = new Error('Cannot create an order with an empty cart.');
        err.statusCode = 400;
        err.code = 'EMPTY_CART';
        throw err;
      }
      itemsToOrder = cart.items;
      createdFromCart = true;
    }

    // Resolve catalog fields for both direct and cart items before calculating totals.
    itemsToOrder = await Promise.all(itemsToOrder.map(async item => {
      const product = await ProductService.getProductById(item && item.productId);
      if (!product) {
        const err = new Error('Order item product was not found.');
        err.statusCode = 404;
        err.code = 'PRODUCT_NOT_FOUND';
        throw err;
      }

      return {
        ...item,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        subtotal: roundCurrency(product.price * item.quantity)
      };
    }));

    const totals = calculateCartTotals(itemsToOrder);

    const orderId = this.generateOrderId();
    const newOrder = {
      id: orderId,
      orderNumber: orderId,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone ? customer.phone.trim() : '',
        address: customer.address.trim(),
        city: customer.city.trim(),
        postalCode: customer.postalCode.trim()
      },
      items: itemsToOrder,
      financials: totals,
      paymentMethod,
      // Selecting a payment method does not verify a payment.
      paymentStatus: 'pending_payment',
      status: 'pending',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order successfully created.'
        }
      ]
    };

    const orders = readJsonFile(ORDERS_FILE, []);
    orders.push(newOrder);
    writeJsonFile(ORDERS_FILE, orders);

    // If order was created from the active cart, clear the cart now
    if (createdFromCart) {
      await CartService.clearCart();
    }

    return newOrder;
  }

  /**
   * Updates an existing order's status
   */
  static async updateOrderStatus(id, newStatus, note = '') {
    const orders = readJsonFile(ORDERS_FILE, []);
    const index = orders.findIndex(o => o.id === id || o.orderNumber === id);

    if (index === -1) {
      const err = new Error(`Order with ID '${id}' not found.`);
      err.statusCode = 404;
      err.code = 'ORDER_NOT_FOUND';
      throw err;
    }

    const order = orders[index];
    const previousStatus = order.status;
    const cleanStatus = newStatus.toLowerCase();

    if (!STATUS_TRANSITIONS[previousStatus]?.includes(cleanStatus)) {
      const err = new Error(`Cannot change order status from '${previousStatus}' to '${cleanStatus}'.`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    order.status = cleanStatus;
    order.updatedAt = new Date().toISOString();

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: cleanStatus,
      previousStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status changed from ${previousStatus} to ${cleanStatus}`
    });

    orders[index] = order;
    writeJsonFile(ORDERS_FILE, orders);
    return order;
  }
}

module.exports = OrderService;
