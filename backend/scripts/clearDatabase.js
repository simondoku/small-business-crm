// backend/scripts/clearDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Category = require('../models/Category');

const clearDatabase = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Clearing all collections...');
        
        // Clear all collections
        await User.deleteMany({});
        console.log('✓ Users collection cleared');
        
        await Customer.deleteMany({});
        console.log('✓ Customers collection cleared');
        
        await Product.deleteMany({});
        console.log('✓ Products collection cleared');
        
        await Sale.deleteMany({});
        console.log('✓ Sales collection cleared');
        
        await Category.deleteMany({});
        console.log('✓ Categories collection cleared');

        console.log('\n🎉 Database cleared successfully!');
        console.log('You can now test the hierarchical admin system with a fresh database.');
        
    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
        process.exit(0);
    }
};

clearDatabase();