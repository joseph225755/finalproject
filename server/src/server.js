import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`===============================================`);
      logger.info(`InternTrack Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/api/health`);
      logger.info(`===============================================`);
    });
  } catch (err) {
    logger.error('Failed to start server due to database connection error:', err);
    // Continue running app so healthcheck and clear 503 can be returned rather than total hard crash
    server = app.listen(PORT, () => {
      logger.warn(`Server started on port ${PORT} with DB disconnected. Waiting for valid database configuration.`);
    });
  }
};

startServer();

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful Termination
const handleGracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received. Closing HTTP server and database connections...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
