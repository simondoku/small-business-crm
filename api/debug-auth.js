// api/debug-auth.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/User");
const allowCors = require("./serverless");

// Connect to MongoDB function
const connectMongo = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    }
    return { connected: true };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return { connected: false, error: error.message };
  }
};

// Add mock user for local development
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin",
};

// Debug auth handler function
const debugAuthHandler = async (req, res) => {
  if (req.method !== "GET" && req.method !== "OPTIONS") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Debug auth request received");

    // Check environment variables
    const envCheck = {
      hasJwtSecret: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET
        ? process.env.JWT_SECRET.length
        : 0,
      hasMongoUri: !!process.env.MONGO_URI,
    };

    // Check authorization header
    const authHeader = req.headers.authorization;
    const authCheck = {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader
        ? authHeader.substring(0, 20) + "..."
        : "none",
      startsWithBearer: authHeader ? authHeader.startsWith("Bearer ") : false,
    };

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json({
        message: "Debug: No valid auth header",
        envCheck,
        authCheck,
        step: "auth_header_missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const tokenCheck = {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + "..." : "none",
    };

    // Try to decode JWT without verification first
    let decodedWithoutVerification;
    try {
      decodedWithoutVerification = jwt.decode(token);
    } catch (decodeError) {
      return res.status(200).json({
        message: "Debug: Token decode failed",
        envCheck,
        authCheck,
        tokenCheck,
        error: decodeError.message,
        step: "token_decode_failed",
      });
    }

    // Try to verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      return res.status(200).json({
        message: "Debug: Token verification failed",
        envCheck,
        authCheck,
        tokenCheck,
        decodedWithoutVerification,
        verifyError: verifyError.message,
        step: "token_verification_failed",
      });
    }

    // Check if this is the mock user ID
    const isLocalDev =
      process.env.NODE_ENV === "development" || !process.env.VERCEL;
    if (isLocalDev && decoded.id === mockUser._id) {
      return res.status(200).json({
        message: "Debug: Mock authentication successful!",
        envCheck,
        authCheck,
        tokenCheck,
        decoded,
        user: mockUser,
        step: "mock_success",
      });
    }

    // Connect to MongoDB and try to find user
    const db = await connectMongo();
    if (!db.connected) {
      // If MongoDB fails in local dev and we have the mock user ID, return mock user
      if (isLocalDev && decoded.id === mockUser._id) {
        return res.status(200).json({
          message: "Debug: MongoDB failed, using mock user",
          envCheck,
          authCheck,
          tokenCheck,
          decoded,
          user: mockUser,
          dbError: db.error,
          step: "mock_fallback",
        });
      }

      return res.status(200).json({
        message: "Debug: Database connection failed",
        envCheck,
        authCheck,
        tokenCheck,
        decoded,
        dbError: db.error,
        step: "db_connection_failed",
      });
    }

    // Try to find user
    let user;
    try {
      user = await User.findById(decoded.id).select("-password");
    } catch (userError) {
      // If user lookup fails in local dev and we have the mock user ID, return mock user
      if (isLocalDev && decoded.id === mockUser._id) {
        return res.status(200).json({
          message: "Debug: User lookup failed, using mock user",
          envCheck,
          authCheck,
          tokenCheck,
          decoded,
          user: mockUser,
          userError: userError.message,
          step: "mock_fallback",
        });
      }

      return res.status(200).json({
        message: "Debug: User lookup failed",
        envCheck,
        authCheck,
        tokenCheck,
        decoded,
        userError: userError.message,
        step: "user_lookup_failed",
      });
    }

    // Return success with all debug info
    res.status(200).json({
      message: "Debug: Authentication successful!",
      envCheck,
      authCheck,
      tokenCheck,
      decoded,
      user: user
        ? {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
          }
        : null,
      step: "success",
    });
  } catch (error) {
    console.error("Error in debug-auth endpoint:", error);
    res.status(500).json({
      message: "Debug: Server error",
      error: error.message,
      step: "server_error",
    });
  }
};

module.exports = allowCors(debugAuthHandler);
