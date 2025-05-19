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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Apply security headers
app.use(helmet());

// Compression middleware
app.use(compression());

// Middleware
app.use(cors());
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