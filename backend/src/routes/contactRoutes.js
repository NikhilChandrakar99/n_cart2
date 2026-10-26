/**
 * Contact Routes
 */

const express = require('express');
const ContactController = require('../controllers/contactController');
const { validateContactMiddleware } = require('../validators/contactValidator');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', ContactController.getSubmissions);
router.post('/', strictLimiter, validateContactMiddleware, ContactController.submitContactForm);

module.exports = router;
