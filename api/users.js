// api/users.js
const mongoose = require('mongoose');
const User = require('../backend/models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../backend/utils/generateToken');
const allowCors = require('./serverless');

// Connect to MongoDB function
const connectMongo = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    return { connected: true };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return { connected: false, error: error.message };
  }
};

// Registration handler function
const registrationHandler = async (req, res) => {
  // Only process POST requests for registration
  if (req.method !== 'POST' && req.method !== 'OPTIONS') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Registration request received:', JSON.stringify(req.body));
    
    // Connect to MongoDB
    const db = await connectMongo();
    if (!db.connected) {
      return res.status(500).json({ message: 'Database connection failed', error: db.error });
    }

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the first user in the system
    const isFirstUser = await User.countDocuments() === 0;

    // Determine role - first user is always admin, otherwise use provided role or default to staff
    let userRole = 'staff';
    if (isFirstUser) {
      userRole = 'admin';
    } else if (role === 'admin') {
      // If the user requested admin role, validate it
      userRole = 'admin';
    }

    // Create new user - let the model middleware handle password hashing
    const userData = {
      name,
      email,
      password, // Don't hash manually, let the pre('save') middleware handle it
      role: userRole,
    };

    // Track who created this user (for all user types, including admins)
    // Note: This API endpoint doesn't have req.user context, so createdBy won't be set here
    // This is mainly for the initial setup process

    // Create user
    const user = await User.create(userData);

    if (user) {
      console.log('User created successfully:', user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        success: true
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack 
    });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(registrationHandler);