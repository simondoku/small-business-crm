// backend/scripts/fixBusinessOwnersRobust.js
const mongoose = require('mongoose');
require('dotenv').config();

async function fixBusinessOwnersRobust() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/small-business-crm');
    console.log('✅ Connected');
    
    // Use direct MongoDB operations for more reliable updates
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all users to see current state
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`\n📊 Found ${allUsers.length} total users:`);
    
    for (const user of allUsers) {
      console.log(`   - ${user.name} (${user.email}): businessOwner=${user.businessOwner || 'null'}, createdBy=${user.createdBy || 'null'}`);
    }
    
    // Find users with null businessOwner
    const usersToFix = await usersCollection.find({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }]
    }).toArray();
    
    console.log(`\n🔧 Fixing ${usersToFix.length} users with null businessOwner:`);
    
    let fixedCount = 0;
    for (const user of usersToFix) {
      console.log(`   Fixing: ${user.name} (${user.email})`);
      
      // Update each user to be their own business owner
      const result = await usersCollection.updateOne(
        { _id: user._id },
        { $set: { businessOwner: user._id } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`     ✅ Updated successfully`);
        fixedCount++;
      } else {
        console.log(`     ❌ Update failed`);
      }
    }
    
    // Also fix any null createdBy fields for non-admin users
    const usersWithNullCreatedBy = await usersCollection.find({
      $and: [
        { role: { $ne: 'admin' } },
        { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] }
      ]
    }).toArray();
    
    if (usersWithNullCreatedBy.length > 0) {
      // Find the first admin to assign as creator
      const firstAdmin = await usersCollection.findOne({ role: 'admin' });
      
      if (firstAdmin) {
        console.log(`\n🔧 Fixing ${usersWithNullCreatedBy.length} users with null createdBy:`);
        
        for (const user of usersWithNullCreatedBy) {
          console.log(`   Fixing createdBy for: ${user.name} (${user.email})`);
          
          const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: { createdBy: firstAdmin._id } }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`     ✅ Set createdBy to ${firstAdmin.name}`);
          }
        }
      }
    }
    
    // Final verification
    console.log(`\n🎯 Final verification:`);
    const finalUsers = await usersCollection.find({}).toArray();
    
    for (const user of finalUsers) {
      console.log(`   - ${user.name}: businessOwner=${user.businessOwner || 'null'}, createdBy=${user.createdBy || 'null'}`);
    }
    
    const stillBroken = await usersCollection.countDocuments({
      $or: [{ businessOwner: { $exists: false } }, { businessOwner: null }]
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Users fixed: ${fixedCount}`);
    console.log(`   Users still with null businessOwner: ${stillBroken}`);
    
    if (stillBroken === 0) {
      console.log('\n🎉 All users now have proper businessOwner fields!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from database');
  }
}

fixBusinessOwnersRobust();