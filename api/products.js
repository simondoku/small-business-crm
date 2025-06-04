// api/products.js
const mongoose = require("mongoose");
const Product = require("../backend/models/Product");
const jwt = require("jsonwebtoken");
const User = require("../backend/models/User");
const allowCors = require("./serverless");

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

// Auth helper function for serverless with mock support
const authenticateUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if this is local development and the mock user
  const isLocalDev =
    process.env.NODE_ENV === "development" || !process.env.VERCEL;
  if (isLocalDev && decoded.id === mockUser._id) {
    console.log("Using mock user for authentication");
    return mockUser;
  }

  // Try to find user in MongoDB (for production)
  try {
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      // If user not found in local dev and it's the mock user ID, return mock user
      if (isLocalDev && decoded.id === mockUser._id) {
        return mockUser;
      }
      throw new Error("User not found");
    }
    return user;
  } catch (mongoError) {
    // If MongoDB fails in local dev and it's the mock user ID, return mock user
    if (isLocalDev && decoded.id === mockUser._id) {
      console.log("MongoDB failed, using mock user fallback");
      return mockUser;
    }
    throw mongoError;
  }
};

// Products handler function
const productsHandler = async (req, res) => {
  try {
    console.log("Products API request:", req.method, req.url);

    // Handle different HTTP methods
    switch (req.method) {
      case "GET":
        try {
          // Authentication first - before trying MongoDB
          const user = await authenticateUser(req);

          if (!user || !user._id) {
            console.error(
              "Authentication failed: user is undefined or missing _id"
            );
            return res.status(401).json({ message: "Authentication failed" });
          }

          console.log("Authenticated user:", user.email, "ID:", user._id);

          // For local development with mock user, return mock products
          const isLocalDev =
            process.env.NODE_ENV === "development" || !process.env.VERCEL;
          if (isLocalDev && user._id === mockUser._id) {
            console.log("Returning mock products for local development");
            const mockProducts = [
              {
                _id: "60f7b3b3b3b3b3b3b3b3b3b1",
                name: "Sample Product 1",
                price: 29.99,
                category: "Electronics",
                description: "A sample electronic product",
                stock: 10,
                sku: "ELEC001",
                createdBy: mockUser._id,
                createdAt: new Date(),
              },
              {
                _id: "60f7b3b3b3b3b3b3b3b3b3b2",
                name: "Sample Product 2",
                price: 49.99,
                category: "Accessories",
                description: "A sample accessory product",
                stock: 25,
                sku: "ACC001",
                createdBy: mockUser._id,
                createdAt: new Date(),
              },
            ];
            return res.status(200).json(mockProducts);
          }

          // Connect to MongoDB for production
          const db = await connectMongo();
          if (!db.connected) {
            console.error("Database connection failed:", db.error);

            // In local development, fall back to mock products
            if (isLocalDev) {
              console.log("MongoDB failed, returning mock products");
              const mockProducts = [
                {
                  _id: "60f7b3b3b3b3b3b3b3b3b3b1",
                  name: "Sample Product 1",
                  price: 29.99,
                  category: "Electronics",
                  description: "A sample electronic product",
                  stock: 10,
                  sku: "ELEC001",
                  createdBy: mockUser._id,
                  createdAt: new Date(),
                },
              ];
              return res.status(200).json(mockProducts);
            }

            return res
              .status(500)
              .json({ message: "Database connection failed", error: db.error });
          }

          const products = await Product.find({}).sort({ createdAt: -1 });
          console.log("Found products:", products.length);

          res.status(200).json(products);
        } catch (authError) {
          console.error("Auth error in GET:", authError.message);
          return res
            .status(401)
            .json({ message: "Authentication required: " + authError.message });
        }
        break;

      case "POST":
        try {
          // Authentication first - before trying MongoDB
          const user = await authenticateUser(req);

          if (!user || !user._id) {
            console.error(
              "Authentication failed: user is undefined or missing _id"
            );
            return res.status(401).json({ message: "Authentication failed" });
          }

          console.log(
            "Creating product for user:",
            user.email,
            "ID:",
            user._id
          );

          // Check if user has staff or admin role
          if (user.role !== "staff" && user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
          }

          const { name, price, category, description, stockQuantity, sku } =
            req.body;

          if (!name || price === undefined) {
            return res
              .status(400)
              .json({ message: "Name and price are required" });
          }

          // For local development with mock user, return mock created product
          const isLocalDev =
            process.env.NODE_ENV === "development" || !process.env.VERCEL;
          if (isLocalDev && user._id === mockUser._id) {
            console.log("Creating mock product for local development");
            const mockProduct = {
              _id: "60f7b3b3b3b3b3b3b3b3b3b" + Date.now(),
              name,
              price: Number(price),
              category: category || "Uncategorized",
              description: description || "",
              stock: Number(stockQuantity) || 0,
              sku: sku || "",
              createdBy: mockUser._id,
              createdAt: new Date(),
              mock: true,
            };
            return res.status(201).json(mockProduct);
          }

          // Connect to MongoDB for production
          const db = await connectMongo();
          if (!db.connected) {
            console.error("Database connection failed:", db.error);

            // In local development, fall back to mock product creation
            if (isLocalDev) {
              console.log("MongoDB failed, creating mock product");
              const mockProduct = {
                _id: "60f7b3b3b3b3b3b3b3b3b3b" + Date.now(),
                name,
                price: Number(price),
                category: category || "Uncategorized",
                description: description || "",
                stock: Number(stockQuantity) || 0,
                sku: sku || "",
                createdBy: mockUser._id,
                createdAt: new Date(),
                mock: true,
              };
              return res.status(201).json(mockProduct);
            }

            return res
              .status(500)
              .json({ message: "Database connection failed", error: db.error });
          }

          // Create product in MongoDB
          const product = await Product.create({
            name,
            price: Number(price),
            category: category || "Uncategorized",
            description: description || "",
            stock: Number(stockQuantity) || 0,
            sku: sku || "",
            createdBy: user._id,
          });

          console.log("Product created:", product._id);
          res.status(201).json(product);
        } catch (authError) {
          console.error("Auth error in POST:", authError.message);
          if (authError.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
          }
          if (authError.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
          }
          return res
            .status(401)
            .json({ message: "Authentication failed: " + authError.message });
        }
        break;

      default:
        res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Products API error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Export the handler wrapped with CORS middleware
module.exports = allowCors(productsHandler);
