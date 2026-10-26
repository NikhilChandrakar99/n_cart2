/**
 * Express Application Setup
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const config = require('./config');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const apiRoutes = require('./routes');

const app = express();

// Security HTTP headers with custom Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://unpkg.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Parse incoming JSON and form payloads
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Rate limiter for API endpoints
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', apiRoutes);

// Serve static frontend files from workspace root
app.use(express.static(config.staticDir));

// Fallback to index.html for root if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(config.staticDir, 'index.html'));
});

// Handle 404 for unmapped API routes
app.use('/api', notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
