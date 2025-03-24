// src/utils/authUtils.js

/**
 * Check if a user has the required role to perform an action
 * @param {Object} user - The user object
 * @param {string|Array} requiredRole - Required role(s) to access 
 * @returns {boolean} - Whether the user has the required role
 */
export const hasPermission = (user, requiredRole) => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // For string role requirements
    if (typeof requiredRole === 'string') {
      if (requiredRole === 'any') return true; // Any logged in user has access
      if (requiredRole === 'admin') return user.role === 'admin';
      if (requiredRole === 'staff') return user.role === 'staff' || user.role === 'admin';
    }
    
    // For array of required roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return false;
  };
  
  /**
   * Get a list of features the user has access to
   * @param {Object} user - The user object
   * @returns {Object} - Object with feature flags
   */
  export const getUserFeatures = (user) => {
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff' || isAdmin;
    
    return {
      // Admin features
      userManagement: isAdmin,
      resetData: isAdmin,
      systemSettings: isAdmin,
      
      // Staff features
      viewDashboard: isStaff,
      manageProducts: isStaff,
      manageCustomers: isStaff,
      createSales: isStaff,
      viewReports: isStaff
    };
  };
  
  /**
   * Format display name for user role
   * @param {string} role - The user's role
   * @returns {string} - Formatted role name
   */
  export const formatRoleName = (role) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'staff') return 'Staff Member';
    return role;
  };