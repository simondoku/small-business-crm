// backend/controllers/adminController.js
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const resetDashboard = async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to perform this action' });
      }
      
      //delete sales data
      await Sale.deleteMany({});

      res.status(200).json({ message: 'Dashboard data reset successfully' });
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = {
    resetDashboard
  };