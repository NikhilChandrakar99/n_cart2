/**
 * Order Routes
 */

const express = require('express');
const OrderController = require('../controllers/orderController');
const {
  validateOrderMiddleware,
  validateOrderStatusMiddleware
} = require('../validators/orderValidator');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', strictLimiter, validateOrderMiddleware, OrderController.createOrder);
router.patch('/:id/status', validateOrderStatusMiddleware, OrderController.updateOrderStatus);

module.exports = router;
