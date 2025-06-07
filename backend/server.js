// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products");
const customerRoutes = require("./routes/customers");
const salesRoutes = require("./routes/sales");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payments");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 5003; // Updated to default to 5003 to match .env
const NODE_ENV = process.env.NODE_ENV || "development";

// Temporarily allow all origins during development and deployment transition
app.use(
  cors({
    origin: "*", // Allow all origins temporarily
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    maxAge: 86400,
  })
);

// Enable pre-flight across-the-board for all routes
app.options("*", cors());

// Manual CORS headers for extra assurance
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// Apply security headers - configured for cross-origin access
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP temporarily to debug
  })
);

// Compression middleware for production
app.use(
  compression({
    level: 6, // Balance between compression speed and ratio
    threshold: 10 * 1024, // Only compress responses larger than 10kb
    filter: (req, res) => {
      // Don't compress responses with this header
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Compress all other responses
      return compression.filter(req, res);
    },
  })
);

// Implement rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Setup request logging - different formats for dev and prod
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Use a more concise logging format in production
  app.use(
    morgan("combined", {
      skip: function (req, res) {
        return res.statusCode < 400;
      }, // Only log errors in production
    })
  );
}

// API Routes - all prefixed with /api for consistency
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// Health check endpoint for monitoring
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: NODE_ENV });
});

// Root route returns API information instead of serving frontend
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Small Business CRM API is running",
    version: "1.0",
    environment: NODE_ENV,
    documentation: "/api/docs", // If you implement API documentation later
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Don't leak error details in production
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: NODE_ENV === "production" ? "Server Error" : err.message,
    stack: NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

// For Vercel serverless deployment, export the app instead of listening
if (NODE_ENV === "production") {
  console.log(
    "Payment features are disabled - focusing on core application features"
  );
  console.log(`Server configured for ${NODE_ENV} mode`);
  // Export the app for Vercel
  module.exports = app;
} else {
  // Start server normally in development
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      "Payment features are disabled - focusing on core application features"
    );
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log("MongoDB Connected: localhost");
  });
}
