// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'staff'],
            default: 'staff',
        },
        // New fields for transaction tracking and payment status
        transactionCount: {
            type: Number,
            default: 0
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        subscriptionStatus: {
            type: String,
            enum: ['free', 'trial', 'paid', 'expired'],
            default: 'free'
        },
        subscriptionExpiry: {
            type: Date,
            default: null
        },
        lastPaymentDate: {
            type: Date,
            default: null
        },
        // Login activity tracking
        lastLogin: {
            type: Date,
            default: null
        },
        lastLogout: {
            type: Date,
            default: null
        },
        loginHistory: [{
            action: {
                type: String,
                enum: ['login', 'logout'],
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            ipAddress: {
                type: String,
                default: ''
            },
            userAgent: {
                type: String,
                default: ''
            }
        }]
    },
    {
        timestamps: true,
    }
);

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;