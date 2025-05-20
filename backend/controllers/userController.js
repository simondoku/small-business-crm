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
            // Record login activity
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            
            user.lastLogin = new Date();
            user.loginHistory.push({
                action: 'login',
                timestamp: new Date(),
                ipAddress,
                userAgent
            });
            
            await user.save();

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

// Record user logout
const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (user) {
            // Record logout activity
            const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            
            user.lastLogout = new Date();
            user.loginHistory.push({
                action: 'logout',
                timestamp: new Date(),
                ipAddress,
                userAgent
            });
            
            await user.save();
            
            res.json({ message: 'Logged out successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user activity history (admin only)
const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Only admins can view user activity
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const user = await User.findById(userId).select('name email loginHistory lastLogin lastLogout');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            lastLogin: user.lastLogin,
            lastLogout: user.lastLogout,
            loginHistory: user.loginHistory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register a new user
const registerUser = async (req, res) => {
    try {
        console.log('Registration request received:', JSON.stringify({
            ...req.body,
            password: '[REDACTED]'
        }));

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check for existing admin users - more reliable than a simple count
        const adminExists = await User.findOne({ role: 'admin' });
        console.log('Admin exists check:', adminExists ? 'Yes' : 'No');
        
        // If this is a setup request (first admin) and an admin already exists
        if (!role && adminExists) {
            return res.status(400).json({ 
                message: 'System is already initialized with an admin account',
                initialized: true
            });
        }

        // Determine user role - admin if no admins exist and this is initial setup
        const userRole = !adminExists ? 'admin' : (role || 'staff');
        console.log('Assigning role:', userRole);

        // Hash password manually instead of relying on mongoose middleware
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user without relying on middleware
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });

        if (user) {
            console.log('User created successfully:', user._id);
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
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack 
        });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, password } = req.body;
        
        // Only admins can update users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent admins from demoting themselves
        if (user._id.toString() === req.user._id.toString() && role && role !== 'admin') {
            return res.status(400).json({ message: 'Admins cannot demote themselves' });
        }
        
        // Update basic fields
        user.name = name || user.name;
        user.email = email || user.email;
        
        // Only update role if specified
        if (role) {
            user.role = role;
        }
        
        // Only update password if provided
        if (password) {
            user.password = password;
        }
        
        // Save updated user
        const updatedUser = await user.save();
        
        // Return updated user data
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin
        });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Only admins can delete users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent admins from deleting their own account
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Admins cannot delete their own account' });
        }
        
        // Check if this is the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin account' });
            }
        }
        
        // Delete the user using findByIdAndDelete instead of remove()
        await User.findByIdAndDelete(userId);
        
        res.json({ message: 'User deleted successfully' });
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

        const users = await User.find({}).select('-password -loginHistory');
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
    getUsers,
    logoutUser,
    getUserActivity,
    updateUser,
    deleteUser
};