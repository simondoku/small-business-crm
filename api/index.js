// api/index.js - Vercel API endpoint
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import routes
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

// Improved MongoDB connection for serverless environments
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) { // Only connect if not already connected
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log('MongoDB already connected.');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Stack trace:', error.stack);
    // Don't exit process, handle gracefully for serverless
    return { error: true, message: error.message };
  }
};

// Connect to MongoDB and don't proceed if connection fails
connectDB().then(result => {
  if (result && result.error) {
    console.error('Failed to connect to MongoDB. API may not function correctly.');
  }
});

// Apply security headers
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration with allowed domains
const corsOptions = {
  origin: [
    'https://www.bcrm.dev',
    'https://bcrm.dev',
    // Include Vercel deployment URLs as fallbacks
    'https://businesscrm-d9td6uxqg-simons-projects-94c78eac.vercel.app',
    // Allow localhost for development
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
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
  res.status(404).json({ message: 'API endpoint not found' });
});

module.exports = app;