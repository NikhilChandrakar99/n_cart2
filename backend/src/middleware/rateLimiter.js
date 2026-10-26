/**
 * Rate Limiting Middleware
 * Protects endpoints from abuse and brute-force traffic.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

// Standard API rate limiter (e.g. 300 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  }
});

// Stricter rate limiter for sensitive write endpoints like contact and orders
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Submission limit reached. Please wait before submitting again.',
    errorCode: 'STRICT_RATE_LIMIT_EXCEEDED'
  }
});

module.exports = {
  apiLimiter,
  strictLimiter
};
