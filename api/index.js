// api/index.js - Vercel API endpoint
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import routes - directly import user routes from the backend for simplicity
const userRoutes = require('../backend/routes/userRoutes');
const productRoutes = require('../backend/routes/products');
const customerRoutes = require('../backend/routes/customers');
const salesRoutes = require('../backend/routes/sales');
const analyticsRoutes = require('../backend/routes/analytics');
const adminRoutes = require('../backend/routes/admin');
const paymentRoutes = require('../backend/routes/payments');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Initialize express
const app = express();

// Global variable to track connection state
let isConnecting = false;

// Debug MongoDB connection details (safely)
const debugMongoURI = (uri) => {
  if (!uri) return 'MongoDB URI is undefined or empty!';
  
  try {
    // Parse and mask sensitive parts of the connection string
    const maskedURI = uri.replace(
      /(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/,
      '$1$3:****@'
    );
    return maskedURI;
  } catch (error) {
    return 'Unable to parse MongoDB URI';
  }
};

// Improved MongoDB connection for serverless environments with much higher timeouts
const connectDB = async () => {
  try {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      console.log('Connection attempt already in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    if (mongoose.connection.readyState === 0) { // Only connect if not already connected
      isConnecting = true;
      // Debug connection string (with masked credentials)
      console.log('Attempting MongoDB connection with URI:', debugMongoURI(process.env.MONGO_URI));
      
      // Check if MONGO_URI is defined
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not defined');
      }
      
      console.log('Connecting to MongoDB Atlas...');
      
      // Add connection options with MUCH longer timeouts for serverless environments
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Increased from 10000ms to 30000ms
        socketTimeoutMS: 60000,          // Increased from 45000ms to 60000ms
        connectTimeoutMS: 30000,         // Explicit connect timeout
        family: 4,                       // Use IPv4, skip trying IPv6
        retryWrites: true,
        retryReads: true,
        maxPoolSize: 10,                 // Recommended for serverless
        bufferCommands: false,           // Disable buffering for faster failures
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      isConnecting = false;
    } else {
      console.log('MongoDB already connected.');
    }
  } catch (error) {
    isConnecting = false;
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Stack trace:', error.stack);
    
    // Provide more helpful error information
    if (error.message.includes('whitelist')) {
      console.error('IMPORTANT: You need to whitelist your Vercel deployment IP in MongoDB Atlas.');
      console.error('For serverless deployments, you may need to allow access from anywhere (0.0.0.0/0)');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('IMPORTANT: Your MongoDB connection string appears to be invalid.');
      console.error('Please check the format of your MONGO_URI environment variable.');
    }
    
    if (error.message.includes('authentication failed')) {
      console.error('IMPORTANT: MongoDB authentication failed.');
      console.error('Please check your username and password in the connection string.');
    }
    
    // Don't exit process, handle gracefully for serverless
    return { error: true, message: error.message };
  }
};

// Connect to MongoDB before handling any requests
app.use(async (req, res, next) => {
  try {
    // Check connection state before each request
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, attempting to connect...');
      await connectDB();
      
      // If still not connected after attempt, return error
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ 
          message: 'Database connection issue. Please try again later.'
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error in MongoDB connection middleware:', error);
    return res.status(500).json({ 
      message: 'Database connection issue. Please try again later.'
    });
  }
});

// Request logging middleware - add this before routes
app.use((req, res, next) => {
  console.log(`API Request: [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Apply security headers
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration with allowed domains
const corsOptions = {
  origin: function(origin, callback) {
    // Define allowed origins - include both fixed domains and environment variable
    const allowedOrigins = [
      'https://www.bcrm.dev',
      'https://bcrm.dev',
      process.env.FRONTEND_URL,
      // Include Vercel deployment URLs as fallbacks
      'https://businesscrmfrontend.vercel.app',
      'https://businesscrmfrontend-6kfisfl2f-simons-projects-94c78eac.vercel.app',
      'https://businesscrm-4emsmbbae-simons-projects-94c78eac.vercel.app',
      'https://businesscrm-njuawefyw-simons-projects-94c78eac.vercel.app',
      'https://businesscrm-7g231acrj-simons-projects-94c78eac.vercel.app',
      'https://businesscrm-7xsxqd71m-simons-projects-94c78eac.vercel.app',
      'https://businesscrm-d9td6uxqg-simons-projects-94c78eac.vercel.app',
      // Allow localhost for development
      'http://localhost:3000'
    ].filter(Boolean); // Remove any undefined entries
    
    // Log the origin being checked for debugging
    console.log('CORS check - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin));
    
    // Allow requests with no origin (like mobile apps) or from allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      // Instead of blocking, let's temporarily allow all origins to debug
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400, // Cache preflight response for 24 hours
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(cors(corsOptions));

// Add explicit CORS headers as backup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));

// Apply API routes WITHOUT the /api prefix as Vercel handles that for us
// The routes will be accessed as /api/users, /api/products, etc.
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/customers', customerRoutes);
app.use('/sales', salesRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/admin', adminRoutes);
app.use('/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to help diagnose routing issues
app.get('/debug', (req, res) => {
  const routes = []; 
  
  // Extract registered routes
  app._router.stack.forEach(middleware => {
    if(middleware.route){ // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if(middleware.name === 'router'){ // router middleware
      middleware.handle.stack.forEach(handler => {
        if(handler.route){
          const path = handler.route.path;
          routes.push({
            path: middleware.regexp.toString().includes('\\u002Fusers') ? 
                  `/users${path}` : 
                  middleware.regexp.toString().includes('\\u002Fproducts') ? 
                  `/products${path}` : path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.status(200).json({ 
    message: 'API is working',
    requestInfo: {
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      hostname: req.hostname
    },
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    registeredRoutes: routes,
    howToAccess: "These endpoints should be accessed via /api/<endpoint> in the browser"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Handle 404s
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl} - Not Found`);
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedPath: req.originalUrl
  });
});

module.exports = app;