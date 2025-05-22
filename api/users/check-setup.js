// api/users/check-setup.js
const mongoose = require('mongoose');
const User = require('../../backend/models/User');
const allowCors = require('../serverless');

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

// Handler function
const checkSetupHandler = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
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

// Export the handler wrapped with CORS middleware
module.exports = allowCors(checkSetupHandler);