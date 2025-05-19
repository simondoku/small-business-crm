// backend/controllers/saleController.js
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({})
      .populate('customer', 'name phone')
      .populate('items.product', 'name');
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('items.product', 'name category');
    
    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ message: 'Sale not found' });
    }
  } catch (error) {
    console.error('Error fetching sale by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a sale with inventory management
const createSale = async (req, res) => {
  try {
    const { customerId, items, comments } = req.body;
    
    // Basic validation
    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required and cannot be empty' });
    }
    
    // Find customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: `Customer with ID ${customerId} not found` });
    }
    
    // Calculate total and prepare items
    let totalAmount = 0;
    const saleItems = [];
    const lowStockProducts = [];
    const soldOutProducts = [];
    
    // Process each item
    for (const item of items) {
      // Find product
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      
      // Check stock levels
      if (product.stock < item.quantity) {
        if (product.stock <= 0) {
          soldOutProducts.push({
            id: product._id,
            name: product.name,
            requested: item.quantity,
            available: 0
          });
        } else {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
      }
      
      // Keep track of products with low stock
      if (product.stock <= 5 && product.stock > 0) {
        lowStockProducts.push({
          id: product._id,
          name: product.name,
          stock: product.stock
        });
      }
      
      // Calculate item total
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      // Add to sale items
      saleItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
      
      // Reduce stock
      if (product.stock > 0) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }
    
    // Create the sale document
    const newSale = new Sale({
      customer: customer._id,
      items: saleItems,
      totalAmount,
      comments
    });
    
    // Save to database
    const savedSale = await newSale.save();
    
    // Update customer's purchase history
    customer.totalPurchases += totalAmount;
    customer.lastPurchaseDate = Date.now();
    await customer.save();
    
    // Return response with warnings for low stock
    res.status(201).json({
      sale: savedSale,
      warnings: {
        lowStock: lowStockProducts.length > 0 ? lowStockProducts : null,
        soldOut: soldOutProducts.length > 0 ? soldOutProducts : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly sales data (add this before the module.exports)
const getMonthlySales = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    // Aggregate monthly sales
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
    
    // Convert month numbers to names
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    
    const formattedResults = monthlySales.map(item => ({
      month: monthNames[item.month - 1],
      revenue: item.revenue
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  getMonthlySales
};