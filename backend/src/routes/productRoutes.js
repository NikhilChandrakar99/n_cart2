/**
 * Product Routes
 */

const express = require('express');
const ProductController = require('../controllers/productController');
const { validateProductMiddleware } = require('../validators/productValidator');

const router = express.Router();

router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', validateProductMiddleware, ProductController.createProduct);
router.put('/:id', validateProductMiddleware, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
