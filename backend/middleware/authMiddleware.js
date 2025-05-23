// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token and attach user to request
const protect = async (req, res, next) => {
  // Always allow OPTIONS requests to pass through without authentication
  // This is crucial for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};

// Admin middleware - verify user is an admin
const admin = (req, res, next) => {
  // Always allow OPTIONS requests to pass through
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Staff middleware - verify user is at least staff (staff or admin)
const staff = (req, res, next) => {
  // Always allow OPTIONS requests to pass through
  if (req.method === 'OPTIONS') {
    return next();
  }

  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized' });
  }
};

module.exports = { protect, admin, staff };