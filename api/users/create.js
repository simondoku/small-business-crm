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
    console.error("JWT verification error:", error);
    return { authenticated: false, error: "Invalid token" };
  }
};

// Create user handler function (admin only)
const createUserHandler = async (req, res) => {
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log(
      "Create user request received:",
      JSON.stringify({
        ...req.body,
        password: req.body.password ? "[REDACTED]" : undefined,
      })
    );

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
      console.log("Authentication failed:", auth.error);
      return res.status(401).json({ message: auth.error || "Invalid token" });
    }

    console.log(
      "Authenticated user:",
      auth.user.email,
      "Role:",
      auth.user.role
    );

    // Only admins can create users
    if (auth.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
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

    // Determine user role
    const userRole = role || "staff";
    console.log("Creating user with role:", userRole);

    // Create new user data with createdBy field
    const userData = {
      name,
      email,
      password, // Let model middleware handle hashing
      role: userRole,
      createdBy: auth.user._id, // Always set createdBy for admin-created users
    };

    console.log("Creating user with createdBy:", auth.user._id);

    const user = await User.create(userData);

    if (user) {
      console.log(
        "User created successfully:",
        user._id,
        "createdBy:",
        user.createdBy
      );
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdBy: user.createdBy,
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
