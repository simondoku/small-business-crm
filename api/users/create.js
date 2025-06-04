// api/users/create.js
const mongoose = require("mongoose");
const User = require("../../backend/models/User");
const generateToken = require("../../backend/utils/generateToken");
const allowCors = require("../serverless");
const jwt = require("jsonwebtoken");

// Global connection promise to reuse connections
let connectionPromise = null;

// Connect to MongoDB function
const connectMongo = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return { connected: true };
    }

    if (connectionPromise) {
      await connectionPromise;
      return { connected: mongoose.connection.readyState === 1 };
    }

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
    connectionPromise = null;
    return { connected: false, error: error.message };
  }
};

// Authentication middleware for serverless
const authenticateUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, error: "No token provided" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return { authenticated: false, error: "User not found" };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: "Invalid token" };
  }
};

// Create user handler function (admin only)
const createUserHandler = async (req, res) => {
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Create user request received");

    // Connect to database
    const db = await connectMongo();
    if (!db.connected) {
      return res.status(500).json({
        message: "Database connection failed",
        error: db.error,
      });
    }

    // Authenticate the requesting user
    const auth = await authenticateUser(req);
    if (!auth.authenticated) {
      return res.status(401).json({ message: auth.error || "Invalid token" });
    }

    // Only admins can create users
    if (auth.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email }).maxTimeMS(5000);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check for existing admin users
    const adminExists = await User.findOne({ role: "admin" }).maxTimeMS(5000);
    console.log("Admin exists check:", adminExists ? "Yes" : "No");

    // Determine user role
    const userRole = !role && !adminExists ? "admin" : role || "staff";
    console.log("Assigning role:", userRole);

    // Create new user data
    const userData = {
      name,
      email,
      password, // Let model middleware handle hashing
      role: userRole,
    };

    // Track who created this user (for all user types, including admins)
    // Only skip createdBy for the very first admin user
    if (auth.user.role === "admin") {
      userData.createdBy = auth.user._id;
      console.log("Setting createdBy to:", auth.user._id);
    } else if (userRole === "admin" && !adminExists) {
      // This is the first admin user - no creator to track
      console.log("First admin user - no createdBy field");
    }

    const user = await User.create(userData);

    if (user) {
      console.log("User created successfully:", user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        success: true,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(createUserHandler);
