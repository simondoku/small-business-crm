// api/users.js - Dedicated route handler for user endpoints
const express = require('express');
const router = express.Router();
const userRoutes = require('../backend/routes/userRoutes');

// Set up middleware specific to this route
router.use(express.json());

// Use the route handlers from the main application
router.use('/', userRoutes);

module.exports = router;