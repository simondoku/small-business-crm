// api/users/check-setup.js
const allowCors = require('../serverless');

// Handler function
const checkSetupHandler = async (req, res) => {
  // Only allow GET requests
  // if (req.method !== 'GET' && req.method !== 'OPTIONS') {
  //   return res.status(405).json({ message: 'Method Not Allowed' });
  // }

  // try {
    // Connect to MongoDB
    // const db = await connectMongo();
    // if (!db.connected) {
    //   return res.status(500).json({ message: 'Database connection failed', error: db.error });
    // }

    // Check specifically for admin users
    // const adminExists = await User.findOne({ role: 'admin' });
    
    // Return system setup status
    // res.status(200).json({ 
    //   initialized: !!adminExists, 
    //   hasAdmin: !!adminExists 
    // });
  // } catch (error) {
  //   console.error('Error in check-setup endpoint:', error);
  //   res.status(500).json({ message: 'Server error' });
  // }
  res.status(200).json({ message: "Test successful from api/users/check-setup.js" });
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(checkSetupHandler);