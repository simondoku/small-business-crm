// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            // Check if admin exists
            const adminExists = await User.findOne({ role: 'admin' });

            if (adminExists) {
                console.log('Admin user already exists');
            } else {
                // Create admin user - let the model middleware handle password hashing
                const admin = new User({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'admin123', // Don't hash manually, let the pre('save') middleware handle it
                    role: 'admin'
                });

                await admin.save();
                console.log('Admin user created successfully');
                console.log('Email: admin@example.com');
                console.log('Password: admin123');
            }
        } catch (error) {
            console.error('Error creating admin user:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });