// backend/routes/sales.js
const express = require('express');
const {
  getSales,
  getSaleById,
  createSale,
  getMonthlySales
} = require('../controllers/saleController');
const { protect, staff } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Public routes (still requires authentication)
router.get('/monthly', getMonthlySales);
router.get('/', getSales);
router.get('/:id', getSaleById);

// Protected routes
router.post('/', staff, createSale);

module.exports = router;