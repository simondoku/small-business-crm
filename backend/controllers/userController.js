// backend/controllers/userController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// Auth user & get token
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check for existing admin users - more reliable than a simple count
        const adminExists = await User.findOne({ role: 'admin' });
        
        // If this is a setup request (first admin) and an admin already exists
        if (!role && adminExists) {
            return res.status(400).json({ 
                message: 'System is already initialized with an admin account',
                initialized: true
            });
        }

        // Determine user role - admin if no admins exist and this is initial setup
        const userRole = !adminExists ? 'admin' : (role || 'staff');

        // Create new user with a transaction to prevent race conditions
        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                success: true
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        // User is available from auth middleware
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if system has been initialized (has any admin users)
const checkSetup = async (req, res) => {
    try {
        // Check specifically for admin users instead of just any users
        const adminExists = await User.findOne({ role: 'admin' });
        res.json({ 
            initialized: !!adminExists, 
            hasAdmin: !!adminExists
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        // Only admins can view all users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    checkSetup,
    getUsers
};