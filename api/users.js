// api/users.js
const mongoose = require("mongoose");
const User = require("../backend/models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../backend/utils/generateToken");
const allowCors = require("./serverless");
const jwt = require("jsonwebtoken");

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

// Add mock user for local development to bypass MongoDB issues
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin",
};

// Get users handler function (admin only with hierarchical permissions)
const getUsersHandler = async (req, res) => {
  try {
    console.log("Get users request received");

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

    // Only admins can view users
    if (auth.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Simple hierarchical query: admin can only see users they created + themselves
    const query = {
      $or: [
        { createdBy: auth.user._id }, // Users created by this admin
        { _id: auth.user._id }, // The admin themselves
      ],
    };

    const users = await User.find(query)
      .select("-password -loginHistory")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .maxTimeMS(10000);

    console.log(
      `Admin ${auth.user._id} (${auth.user.name}) can see ${users.length} users`
    );
    res.json(users);
  } catch (error) {
    console.error("Error in getUsersHandler:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};

// Registration handler function
const registrationHandler = async (req, res) => {
  try {
    console.log("Registration request received:", JSON.stringify(req.body));

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Try MongoDB connection for production or non-mock users
    const db = await connectMongo();
    if (!db.connected) {
      console.error("Database connection failed:", db.error);
      return res
        .status(500)
        .json({ message: "Database connection failed", error: db.error });
    }

    // Check if user already exists with timeout
    const userExists = await User.findOne({ email }).maxTimeMS(5000);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if this is the first user in the system with timeout
    const adminExists = await User.findOne({ role: "admin" }).maxTimeMS(5000);
    const isFirstUser = !adminExists;

    // Determine role - first user is always admin, otherwise use provided role or default to staff
    let userRole = "staff";
    if (isFirstUser) {
      userRole = "admin";
    } else if (role === "admin") {
      // If the user requested admin role, validate it
      userRole = "admin";
    }

    // Create new user - let the model middleware handle password hashing
    const userData = {
      name,
      email,
      password, // Don't hash manually, let the pre('save') middleware handle it
      role: userRole,
    };

    // Track who created this user (for all user types, including admins)
    // Only skip createdBy for the very first admin user
    if (!isFirstUser) {
      // Authenticate the requesting user to get createdBy
      const auth = await authenticateUser(req);
      if (auth.authenticated && auth.user.role === "admin") {
        userData.createdBy = auth.user._id;
        console.log("Setting createdBy to:", auth.user._id);
      } else if (!auth.authenticated) {
        return res
          .status(401)
          .json({ message: "Authentication required to create users" });
      } else {
        return res
          .status(403)
          .json({ message: "Only admins can create users" });
      }
    } else {
      // This is the first admin user - no creator to track
      console.log("First admin user - no createdBy field");
    }

    // Create user
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
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};

// Main handler that routes based on HTTP method
const handler = async (req, res) => {
  console.log(`Handling ${req.method} request to /api/users`); // Added logging for debugging
  
  if (req.method === "GET") {
    // Handle GET requests - list users
    return getUsersHandler(req, res);
  } else if (req.method === "POST") {
    // Handle POST requests - register/create users
    return registrationHandler(req, res);
  } else if (req.method === "OPTIONS") {
    // Handle preflight requests
    return res.status(200).end();
  } else {
    console.log(`Method ${req.method} not allowed for /api/users`); // Added logging
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(handler);
