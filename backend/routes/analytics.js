const express = require('express');
const router = express.Router();
const { getSalesByCategory, getMonthlySales } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all analytics routes
router.use(protect);

// Get sales data by category
router.get('/sales-by-category', getSalesByCategory);

// Get monthly sales data
router.get('/monthly-sales', getMonthlySales);

module.exports = router;