/**
 * Shopping Cart Routes
 */

const express = require('express');
const CartController = require('../controllers/cartController');
const {
  validateAddToCartMiddleware,
  validateUpdateQuantityMiddleware
} = require('../validators/cartValidator');

const router = express.Router();

router.get('/', CartController.getCart);
router.post('/', validateAddToCartMiddleware, CartController.addItem);
router.post('/items', validateAddToCartMiddleware, CartController.addItem);
router.put('/items/:productId', validateUpdateQuantityMiddleware, CartController.updateQuantity);
router.delete('/items/:productId', CartController.removeItem);
router.delete('/', CartController.clearCart);

module.exports = router;
