/**
 * Health Check Routes
 */

const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();

router.get('/', HealthController.getHealth);

module.exports = router;
