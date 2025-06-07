// backend/scripts/fixBusinessOwners.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixBusinessOwners() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/small-business-crm');
    console.log('✅ Connected');
    
    // Get all users with null businessOwner
    const usersToFix = await User.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }]
    }).select('_id name email role');
    
    console.log(`\n📊 Found ${usersToFix.length} users needing businessOwner fix:`);
    
    for (const user of usersToFix) {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      
      // Set businessOwner to the user's own ID (each user is their own business owner)
      await User.findByIdAndUpdate(user._id, {
        businessOwner: user._id
      });
      
      console.log(`     ✅ Fixed: businessOwner set to ${user._id}`);
    }
    
    // Verify the fix
    const remainingBroken = await User.countDocuments({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }]
    });
    
    console.log(`\n🎯 Verification:`);
    console.log(`   Fixed: ${usersToFix.length} users`);
    console.log(`   Remaining with null businessOwner: ${remainingBroken}`);
    
    if (remainingBroken === 0) {
      console.log('\n🎉 All users now have proper businessOwner fields!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from database');
  }
}

fixBusinessOwners();