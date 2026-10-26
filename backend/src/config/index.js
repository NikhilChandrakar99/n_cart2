const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const backendRoot = path.resolve(__dirname, '../../');
const workspaceRoot = path.resolve(backendRoot, '../');

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  backendRoot,
  dataDir: path.resolve(backendRoot, process.env.DATA_DIR || 'src/data'),
  staticDir: workspaceRoot,
  taxRate: 0.18, // 18% sales tax
  shippingFlatRate: 15.00,
  freeShippingThreshold: 150.00
};

module.exports = config;
