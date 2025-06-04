// backend/routes/products.js
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes - user must be authenticated
router.route('/').get(protect, getProducts).post(protect, createProduct);
router.route('/:id').get(protect, getProductById).put(protect, updateProduct).delete(protect, deleteProduct);
router.route('/:id/stock').put(protect, updateProductStock); // New route for stock updates

module.exports = router;