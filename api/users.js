// api/users.js - Direct serverless function for user registration
const mongoose = require('mongoose');
const User = require('../backend/models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../backend/utils/generateToken');

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

// Main handler function
module.exports = async (req, res) => {
  // Set CORS headers directly on the response
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for now
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only process POST requests for registration
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Registration request received:', req.body);
    
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
      // In this implementation, we're allowing the admin role selection during registration
      userRole = 'admin';
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

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