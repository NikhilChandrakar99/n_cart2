/**
 * Category Routes
 */

const express = require('express');
const CategoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);
router.get('/:id/products', CategoryController.getProductsByCategory);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;
