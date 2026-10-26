import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to protect routes and verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'interntrack_default_secret_key_jwt_super_long'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};

/**
 * Middleware to restrict access to specific roles (e.g. 'admin')
 * @param  {...string} roles Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

/**
 * Helper to check resource ownership for students, allowing admins full access
 * @param {Object} resource The document from MongoDB
 * @param {Object} user req.user
 * @param {string} [ownerField='student'] The field containing the student ID
 */
export const verifyOwnership = (resource, user, ownerField = 'student') => {
  if (user.role === 'admin') return true;
  const ownerId = resource[ownerField]?.toString() || resource._id?.toString();
  return ownerId === user._id.toString();
};
