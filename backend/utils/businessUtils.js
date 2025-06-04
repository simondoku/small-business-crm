// backend/utils/businessUtils.js
const User = require('../models/User');

/**
 * Get the business owner (top-level admin) for a given user
 * This ensures all data is scoped to the correct business
 */
const getBusinessOwner = async (userId, visited = new Set()) => {
  try {
    // Prevent infinite recursion
    if (visited.has(userId.toString())) {
      throw new Error('Circular reference detected in user hierarchy');
    }
    visited.add(userId.toString());

    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // If user has no creator, they are the business owner (first admin)
    if (!user.createdBy) {
      return user._id;
    }
    
    // Recursively find the top-level admin
    return await getBusinessOwner(user.createdBy, visited);
  } catch (error) {
    console.error(`Error finding business owner for user ${userId}:`, error.message);
    throw new Error(`Error finding business owner: ${error.message}`);
  }
};

/**
 * Check if a user can access data created by another user
 * Users can only access data from their own business
 */
const canAccessData = async (currentUserId, dataCreatorId) => {
  try {
    // If accessing own data, always allow
    if (currentUserId.toString() === dataCreatorId.toString()) {
      return true;
    }

    const currentUserBusinessOwner = await getBusinessOwner(currentUserId);
    const dataCreatorBusinessOwner = await getBusinessOwner(dataCreatorId);
    
    return currentUserBusinessOwner.toString() === dataCreatorBusinessOwner.toString();
  } catch (error) {
    console.error('Error checking data access:', error.message);
    return false;
  }
};

module.exports = {
  getBusinessOwner,
  canAccessData
};