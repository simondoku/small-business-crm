// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            // Check if admin exists
            const adminExists = await User.findOne({ role: 'admin' });

            if (adminExists) {
                console.log('Admin user already exists');
            } else {
                // Create admin user
                const hashedPassword = await bcrypt.hash('admin123', 10);
                const admin = new User({
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: hashedPassword,
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