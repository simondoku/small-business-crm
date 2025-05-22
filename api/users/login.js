// api/users/login.js - Direct serverless function for user login
const mongoose = require('mongoose');
const User = require('../../backend/models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../../backend/utils/generateToken');

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

// This is a serverless function that will be executed when the endpoint is called
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

  // Only allow POST requests for login
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Connect to MongoDB
    const db = await connectMongo();
    if (!db.connected) {
      return res.status(500).json({ message: 'Database connection failed', error: db.error });
    }

    // Extract email and password from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Record login activity
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      user.lastLogin = new Date();
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({
        action: 'login',
        timestamp: new Date(),
        ipAddress,
        userAgent
      });
      
      await user.save();
      
      // Return user data with JWT token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};