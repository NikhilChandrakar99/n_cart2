/**
 * Health Check Controller
 */

const ApiResponse = require('../utils/apiResponse');
const config = require('../config');

class HealthController {
  static getHealth(req, res) {
    const memory = process.memoryUsage();
    const data = {
      status: 'UP',
      service: 'N_cart eCommerce Backend API',
      version: '1.0.0',
      environment: config.env,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100
      }
    };

    return ApiResponse.success(res, data, 'API service is healthy and operational');
  }
}

module.exports = HealthController;
