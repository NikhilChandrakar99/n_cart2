/**
 * Order Controller
 */

const OrderService = require('../services/orderService');
const ApiResponse = require('../utils/apiResponse');

class OrderController {
  static async getOrders(req, res, next) {
    try {
      const orders = await OrderService.getOrders(req.query);
      return ApiResponse.success(res, orders, 'Orders retrieved successfully', 200, { totalOrders: orders.length });
    } catch (err) {
      next(err);
    }
  }

  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      if (!order) {
        return ApiResponse.error(res, `Order '${id}' was not found.`, 404, null, 'ORDER_NOT_FOUND');
      }
      return ApiResponse.success(res, order, 'Order details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createOrder(req, res, next) {
    try {
      const order = await OrderService.createOrder(req.body);
      return ApiResponse.created(res, order, 'Order placed successfully');
    } catch (err) {
      if (err.statusCode) {
        return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
      }
      next(err);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const updated = await OrderService.updateOrderStatus(id, status, note);
      return ApiResponse.success(res, updated, `Order status updated to '${status}'`);
    } catch (err) {
      if (err.statusCode) {
        return ApiResponse.error(res, err.message, err.statusCode, null, err.code);
      }
      next(err);
    }
  }
}

module.exports = OrderController;
