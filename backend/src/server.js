/**
 * HTTP Server Entry Point
 */

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const server = app.listen(config.port, () => {
  logger.info(`===============================================`);
  logger.info(`  N_cart Full-Stack eCommerce Application`);
  logger.info(`  Environment: ${config.env}`);
  logger.info(`  Server running at: http://localhost:${config.port}`);
  logger.info(`  API Base URL:      http://localhost:${config.port}/api`);
  logger.info(`  Health Check:      http://localhost:${config.port}/api/health`);
  logger.info(`===============================================`);
});

// Graceful shutdown handling
function handleGracefulShutdown(signal) {
  logger.info(`${signal} received: closing HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

module.exports = server;
