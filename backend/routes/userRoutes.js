// backend/routes/userRoutes.js
const express = require('express');
const {
    authUser,
    registerUser,
    getUserProfile,
    checkSetup
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authUser);
router.post('/', registerUser);
router.get('/profile', protect, getUserProfile);
router.get('/check-setup', checkSetup);

module.exports = router;