import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@interntrack.edu';
    const password = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminSecurePass123!';
    const name = 'Platform Administrator';

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = 'admin';
      admin.password = password;
      await admin.save();
      logger.info(`Existing admin updated successfully: ${email}`);
    } else {
      admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
        department: 'Academic Supervision',
        college: 'Faculty of Engineering & Technology'
      });
      logger.info(`New administrator provisioned successfully: ${email}`);
    }

    logger.info(`Admin Credentials: Email: ${email}`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed admin user:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedAdmin();
