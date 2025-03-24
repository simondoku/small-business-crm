// backend/routes/userRoutes.js
const express = require('express');
const {
    authUser,
    registerUser,
    getUserProfile,
    checkSetup,
    getUsers
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', authUser);
router.post('/', registerUser); // Anyone can register, first user will be admin
router.get('/check-setup', checkSetup);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/', protect, admin, getUsers); // Only admin can get all users

module.exports = router;