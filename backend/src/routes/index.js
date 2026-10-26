/**
 * Main API Router
 * Aggregates all modular route handlers under the /api namespace.
 */

const express = require('express');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./cartRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const orderRoutes = require('./orderRoutes');
const contactRoutes = require('./contactRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/contact', contactRoutes);
router.use('/health', healthRoutes);

module.exports = router;
