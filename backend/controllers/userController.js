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

// Register a new user
const registerUser = async (req, res) => {
    try {
        console.log('Registration request received:', JSON.stringify({
            ...req.body,
            password: '[REDACTED]'
        }));

        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check for existing admin users
        const adminExists = await User.findOne({ role: 'admin' });
        console.log('Admin exists check:', adminExists ? 'Yes' : 'No');
        
        // Determine user role
        // If no role specified and this is the first user, make them admin
        // Otherwise use the role from request or default to staff
        const userRole = (!role && !adminExists) ? 'admin' : (role || 'staff');
        console.log('Assigning role:', userRole);

        // Create new user - let the model middleware handle password hashing
        const userData = {
            name,
            email,
            password, // Don't hash manually, let the pre('save') middleware handle it
            role: userRole,
        };

        // Track who created this user (for all user types, including admins)
        // Only skip createdBy for the very first admin user
        if (req.user && req.user.role === 'admin') {
            userData.createdBy = req.user._id;
            console.log('Setting createdBy to:', req.user._id);
        } else if (userRole === 'admin' && !adminExists) {
            // This is the first admin user - no creator to track
            console.log('First admin user - no createdBy field');
        }

        const user = await User.create(userData);

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
        
        // Strict hierarchical check: admin can only update users they created + themselves
        const canUpdate = user._id.toString() === req.user._id.toString() || // Can update themselves
                         (user.createdBy && user.createdBy.toString() === req.user._id.toString()); // Users they created
        
        if (!canUpdate) {
            return res.status(403).json({ message: 'You can only update users you created or yourself' });
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
        
        // Strict hierarchical check: admin can only delete users they created
        const canDelete = user.createdBy && user.createdBy.toString() === req.user._id.toString();
        
        if (!canDelete) {
            return res.status(403).json({ message: 'You can only delete users you created' });
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

// Get user activity history (admin only)
const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Only admins can view user activity
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const user = await User.findById(userId).select('name email loginHistory lastLogin lastLogout createdBy');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Strict hierarchical check: admin can only view activity for users they created + themselves
        const canView = user._id.toString() === req.user._id.toString() || // Their own activity
                       (user.createdBy && user.createdBy.toString() === req.user._id.toString()); // Users they created
        
        if (!canView) {
            return res.status(403).json({ message: 'You can only view activity for users you created or yourself' });
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

// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        // Only admins can view users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Simple hierarchical query: admin can only see users they created + themselves
        const query = {
            $or: [
                { createdBy: req.user._id }, // Users created by this admin
                { _id: req.user._id }        // The admin themselves
            ]
        };

        const users = await User.find(query)
            .select('-password -loginHistory')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        
        console.log(`Admin ${req.user._id} (${req.user.name}) can see ${users.length} users`);
        res.json(users);
    } catch (error) {
        console.error('Error in getUsers:', error);
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