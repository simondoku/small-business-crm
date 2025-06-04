// api/users/login.js
const mongoose = require("mongoose");
const User = require("../../backend/models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../../backend/utils/generateToken");
const allowCors = require("../serverless");

// Global connection promise to reuse connections
let connectionPromise = null;

// Connect to MongoDB function with proper connection reuse for serverless
const connectMongo = async () => {
  try {
    // Reuse existing connection if available
    if (mongoose.connection.readyState === 1) {
      return { connected: true };
    }

    // If connection is in progress, wait for it
    if (connectionPromise) {
      await connectionPromise;
      return { connected: mongoose.connection.readyState === 1 };
    }

    // Create new connection promise
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    await connectionPromise;
    console.log("MongoDB connected successfully");
    return { connected: true };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    connectionPromise = null; // Reset promise on error
    return { connected: false, error: error.message };
  }
};

// Add mock user for local development to bypass MongoDB issues
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin",
};

// Login handler function
const loginHandler = async (req, res) => {
  // Only allow POST requests for login
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Login request received"); // Debug log

    const { email, password } = req.body;
    console.log("Attempting login for email:", email); // Debug log

    // For local development, use mock authentication if MongoDB fails
    const isLocalDev =
      process.env.NODE_ENV === "development" || !process.env.VERCEL;

    if (isLocalDev && email === "admin@test.com" && password === "password") {
      console.log("Using mock authentication for local development");

      // Return mock user data with JWT token
      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id),
        mock: true, // Indicate this is mock data
      });
    }

    // Try MongoDB connection for production or when mock doesn't match
    const db = await connectMongo();
    if (!db.connected) {
      console.error("Database connection failed:", db.error);

      // In local development, fall back to mock if credentials match
      if (isLocalDev && email === "admin@test.com" && password === "password") {
        console.log("MongoDB failed, using mock authentication fallback");
        return res.json({
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          token: generateToken(mockUser._id),
          mock: true,
        });
      }

      return res
        .status(500)
        .json({ message: "Database connection failed", error: db.error });
    }

    // Find the user by email with timeout
    const user = await User.findOne({ email }).maxTimeMS(5000);

    if (user && (await user.matchPassword(password))) {
      console.log("Login successful for user:", user._id); // Debug log

      // Record login activity
      const userAgent = req.headers["user-agent"] || "";
      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      user.lastLogin = new Date();
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({
        action: "login",
        timestamp: new Date(),
        ipAddress,
        userAgent,
      });

      await user.save();

      // Return user data with JWT token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.log("Login failed: Invalid credentials"); // Debug log
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error in login endpoint:", error);

    // In local development, try mock authentication as fallback
    const isLocalDev =
      process.env.NODE_ENV === "development" || !process.env.VERCEL;
    const { email, password } = req.body;

    if (isLocalDev && email === "admin@test.com" && password === "password") {
      console.log("Error occurred, using mock authentication fallback");
      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id),
        mock: true,
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(loginHandler);
