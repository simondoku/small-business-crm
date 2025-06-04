// backend/scripts/migrateBusinessIsolation.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
require('dotenv').config();

const migrateBusinessIsolation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/small-business-crm');
    console.log('Connected to MongoDB');

    // Find all admin users (business owners)
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users (business owners)`);

    if (adminUsers.length === 0) {
      console.log('No admin users found. Please create an admin user first.');
      return;
    }

    // Strategy: Assign all existing data to the first admin user found
    // In production, you might want to manually assign data or ask for user input
    const defaultBusinessOwner = adminUsers[0]._id;
    console.log(`Assigning all existing data to admin: ${adminUsers[0].name} (${adminUsers[0].email})`);

    // Migrate Products
    const productsResult = await Product.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: defaultBusinessOwner } }
    );
    console.log(`Updated ${productsResult.modifiedCount} products`);

    // Migrate Customers
    const customersResult = await Customer.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: defaultBusinessOwner } }
    );
    console.log(`Updated ${customersResult.modifiedCount} customers`);

    // Migrate Sales
    const salesResult = await Sale.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: defaultBusinessOwner } }
    );
    console.log(`Updated ${salesResult.modifiedCount} sales`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n🔒 Business isolation is now enforced:');
    console.log('- Each business owner can only see their own data');
    console.log('- Products, customers, and sales are isolated by business');
    console.log('- Analytics are filtered by business ownership');
    console.log('- Staff members can only see data from their business');

    if (adminUsers.length > 1) {
      console.log('\n⚠️  Multiple admin users detected:');
      adminUsers.forEach((admin, index) => {
        if (index === 0) {
          console.log(`   ${admin.name} (${admin.email}) - Assigned all existing data`);
        } else {
          console.log(`   ${admin.name} (${admin.email}) - No existing data assigned`);
        }
      });
      console.log('\n💡 If you need to redistribute data between businesses, you\'ll need to do this manually.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateBusinessIsolation();
}

module.exports = migrateBusinessIsolation;