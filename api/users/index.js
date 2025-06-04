// api/users/index.js
const mongoose = require("mongoose");
const User = require("../../backend/models/User");
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

// Get users handler function (admin only with hierarchical permissions)
const getUsersHandler = async (req, res) => {
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

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

// Export the handler wrapped with CORS middleware
module.exports = allowCors(getUsersHandler);
