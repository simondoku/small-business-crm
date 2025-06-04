// backend/routes/customers.js
const express = require('express');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes - user must be authenticated
router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').get(protect, getCustomerById).put(protect, updateCustomer).delete(protect, deleteCustomer);

module.exports = router;