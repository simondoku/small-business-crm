// backend/controllers/analyticsController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { getBusinessOwner } = require('../utils/businessUtils');

// Get sales by category (filtered by business)
const getSalesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get the business owner for the current user
    const businessOwner = await getBusinessOwner(req.user._id);
    
    // Parse dates and create query with business filter
    const query = { createdBy: businessOwner };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Aggregate sales by product category for this business only
    const salesByCategory = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      // Filter products to ensure they belong to the same business
      {
        $match: {
          'productInfo.createdBy': businessOwner
        }
      },
      {
        $group: {
          _id: '$productInfo.category',
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
    
    // Format response
    const result = {};
    salesByCategory.forEach(item => {
      const category = item._id || 'Uncategorized';
      result[category] = item.totalSales;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting sales by category:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get monthly sales data (filtered by business)
const getMonthlySales = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();
    
    // Get the business owner for the current user
    const businessOwner = await getBusinessOwner(req.user._id);
    
    // Create date range for the year
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    
    // Aggregate sales by month for this business only
    const monthlySales = await Sale.aggregate([
      { 
        $match: { 
          createdBy: businessOwner,
          createdAt: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);
    
    // Format response
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = monthlySales.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue,
      count: item.count
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error getting monthly sales:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesByCategory,
  getMonthlySales
};