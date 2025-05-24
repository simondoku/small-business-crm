// backend/scripts/testHierarchy.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const testHierarchy = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('🔍 Testing User Hierarchy System\n');
    
    // Get all users and show their relationships
    const allUsers = await User.find({}).select('name email role createdBy').populate('createdBy', 'name email');
    
    console.log('📊 Current Users in System:');
    console.log('================================');
    
    allUsers.forEach(user => {
      const creator = user.createdBy ? `Created by: ${user.createdBy.name} (${user.createdBy.email})` : 'No creator (First Admin)';
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ${creator}`);
      console.log('');
    });
    
    // Show what each admin can see
    const admins = allUsers.filter(user => user.role === 'admin');
    
    console.log('🔐 Admin Permissions:');
    console.log('===================');
    
    for (const admin of admins) {
      console.log(`\n👑 Admin: ${admin.name}`);
      
      // Simulate the query from getUsers
      const query = {
        $or: [
          { createdBy: admin._id }, // Users created by this admin
          { _id: admin._id },       // The admin themselves
        ]
      };
      
      // If this admin has no creator (first admin), they can see other first admins
      if (!admin.createdBy) {
        query.$or.push({
          $and: [
            { role: 'admin' },
            { $or: [
              { createdBy: { $exists: false } },
              { createdBy: null }
            ]},
            { _id: { $ne: admin._id } }
          ]
        });
      }
      
      const visibleUsers = await User.find(query).select('name email role createdBy').populate('createdBy', 'name');
      
      console.log(`   Can see ${visibleUsers.length} users:`);
      visibleUsers.forEach(user => {
        const relation = user._id.equals(admin._id) ? '(self)' : 
                        user.createdBy && user.createdBy._id.equals(admin._id) ? '(created by them)' : 
                        !user.createdBy ? '(first admin)' : '(other)';
        console.log(`   - ${user.name} ${relation}`);
      });
    }
    
    console.log('\n✅ Hierarchy test complete!');
    
  } catch (error) {
    console.error('❌ Error testing hierarchy:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testHierarchy();