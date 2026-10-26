/**
 * Wishlist Routes
 */

const express = require('express');
const WishlistController = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addItem);
router.delete('/:productId', WishlistController.removeItem);
router.delete('/', WishlistController.clearWishlist);

module.exports = router;
