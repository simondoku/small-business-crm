// api/users/check-setup.js - Direct serverless function for user setup check
const mongoose = require('mongoose');
const User = require('../../backend/models/User');

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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Connect to MongoDB
    const db = await connectMongo();
    if (!db.connected) {
      return res.status(500).json({ message: 'Database connection failed', error: db.error });
    }

    // Check specifically for admin users
    const adminExists = await User.findOne({ role: 'admin' });
    
    // Return system setup status
    res.status(200).json({ 
      initialized: !!adminExists, 
      hasAdmin: !!adminExists 
    });
  } catch (error) {
    console.error('Error in check-setup endpoint:', error);
    res.status(500).json({ message: 'Server error' });
  }
};