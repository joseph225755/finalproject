import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let isConnected = false;

/**
 * Connect to MongoDB database
 * @param {string} [uri] Optional custom URI (useful for testing or fallback)
 */
export const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGODB_URI;

  if (!mongoURI) {
    const errorMsg = 'MONGODB_URI is not defined in environment variables. Please configure your MongoDB connection string.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Mask credentials for safe logging
  const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    mongoose.set('strictQuery', true);
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    isConnected = true;
    logger.info(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection runtime error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Reconnecting...');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed targeting ${maskedURI}:`, error);
    isConnected = false;
    throw error;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully.');
  }
};

export const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;
