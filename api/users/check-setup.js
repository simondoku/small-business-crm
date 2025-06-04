// api/users/check-setup.js
const mongoose = require("mongoose");
const User = require("../../backend/models/User");
const allowCors = require("../serverless");

// Global connection variable to reuse connections
let cachedConnection = null;

// Connect to MongoDB function with improved error handling
const connectMongo = async () => {
  try {
    // Reuse existing connection if available
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return { connected: true };
    }

    // Clear any existing connection first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect with optimized settings for serverless
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // Even shorter timeout
      socketTimeoutMS: 5000,
      maxPoolSize: 1,
      minPoolSize: 0,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    cachedConnection = connection;
    console.log("MongoDB connected successfully");
    return { connected: true };
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    return { connected: false, error: error.message };
  }
};

// Handler function with improved error handling
const checkSetupHandler = async (req, res) => {
  // Only allow GET requests
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Check setup request received");

    // Add timeout to the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Setup check timeout")), 8000);
    });

    const checkPromise = async () => {
      const db = await connectMongo();

      if (!db.connected) {
        console.log("Database connection failed, assuming system needs setup");
        return {
          initialized: false,
          hasAdmin: false,
          note: "Database connection failed - assuming setup needed",
        };
      }

      // Try to count admin users with timeout
      try {
        const adminCount = await User.countDocuments({ role: "admin" })
          .maxTimeMS(5000) // 5 second max for the query
          .lean() // Use lean for faster queries
          .exec();

        const hasAdmin = adminCount > 0;
        console.log("Admin count:", adminCount);

        return {
          initialized: hasAdmin,
          hasAdmin: hasAdmin,
        };
      } catch (queryError) {
        console.log("Query failed or timed out:", queryError.message);
        // If query fails, assume system needs setup to be safe
        return {
          initialized: false,
          hasAdmin: false,
          note: "Query failed - assuming setup needed",
        };
      }
    };

    // Race between the check and timeout
    const result = await Promise.race([checkPromise(), timeoutPromise]);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in check-setup endpoint:", error.message);

    // For any error, assume system needs setup to avoid blocking users
    res.status(200).json({
      initialized: false,
      hasAdmin: false,
      note: "Error occurred - assuming setup needed",
    });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(checkSetupHandler);
