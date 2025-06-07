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

// Check setup handler function
const checkSetupHandler = async (req, res) => {
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

// Login handler function
const loginHandler = async (req, res) => {
  try {
    console.log("Login request received");

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Connect to database
    const db = await connectMongo();
    if (!db.connected) {
      return res.status(500).json({
        message: "Database connection failed",
        error: db.error,
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).maxTimeMS(5000);

    if (user && (await bcrypt.compare(password, user.password))) {
      console.log("Login successful for:", user.email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        success: true,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
};

// Create user handler function (admin only)
const createUserHandler = async (req, res) => {
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

// Main handler that routes based on HTTP method and URL path
const handler = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`Handling ${req.method} request to ${pathname}`);

  // Handle OPTIONS for all endpoints
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Route based on pathname and method
  if (pathname === "/api/users/check-setup" && req.method === "GET") {
    return checkSetupHandler(req, res);
  } else if (pathname === "/api/users/login" && req.method === "POST") {
    return loginHandler(req, res);
  } else if (pathname === "/api/users/create" && req.method === "POST") {
    return createUserHandler(req, res);
  } else if (pathname === "/api/users" && req.method === "GET") {
    return getUsersHandler(req, res);
  } else if (pathname === "/api/users" && req.method === "POST") {
    return registrationHandler(req, res);
  } else {
    console.log(`Method ${req.method} not allowed for ${pathname}`);
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(handler);
