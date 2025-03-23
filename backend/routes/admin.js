// backend/routes/admin.js
const express = require('express');
const { resetDashboard } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply both protection middleware - must be logged in AND be admin
router.post('/reset-dashboard', protect, admin, resetDashboard);

module.exports = router;
