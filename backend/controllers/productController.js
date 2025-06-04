// backend/controllers/productController.js
const Product = require('../models/Product');
const { getBusinessOwner, canAccessData } = require('../utils/businessUtils');

// Get all products (filtered by business)
const getProducts = async (req, res) => {
  try {
    // Get the business owner for the current user
    const businessOwner = await getBusinessOwner(req.user._id);
    
    // Only get products created by users in the same business
    const products = await Product.find({ createdBy: businessOwner });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID (with business access check)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user can access this product
    const canAccess = await canAccessData(req.user._id, product.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a product (with business ownership)
const createProduct = async (req, res) => {
  try {
    const { name, category, sku, price, stock, image } = req.body;
    
    // Get the business owner for the current user
    const businessOwner = await getBusinessOwner(req.user._id);
    
    const product = await Product.create({
      name,
      category,
      sku,
      price,
      stock,
      image,
      createdBy: businessOwner, // Assign to business owner
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a product (with business access check)
const updateProduct = async (req, res) => {
  try {
    const { name, category, sku, price, stock, image } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user can access this product
    const canAccess = await canAccessData(req.user._id, product.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Track stock changes for logging
    const oldStock = product.stock;
    const newStock = stock !== undefined ? stock : product.stock;
    
    product.name = name || product.name;
    product.category = category || product.category;
    product.sku = sku || product.sku;
    product.price = price !== undefined ? price : product.price;
    product.stock = newStock;
    product.image = image || product.image;
    
    const updatedProduct = await product.save();
    
    // Log stock changes if they occurred
    if (oldStock !== newStock) {
      console.log(`Stock updated for ${updatedProduct.name}: ${oldStock} → ${newStock} (change: ${newStock - oldStock})`);
    }
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product stock (with business access check)
const updateProductStock = async (req, res) => {
  try {
    const { stock, adjustment } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user can access this product
    const canAccess = await canAccessData(req.user._id, product.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const oldStock = product.stock;
    
    // If adjustment is provided, add to current stock
    if (adjustment) {
      product.stock = oldStock + parseInt(adjustment);
    } else if (stock !== undefined) {
      // Otherwise use the direct stock value
      product.stock = stock;
    }
    
    const updatedProduct = await product.save();
    
    console.log(`Stock updated for ${updatedProduct.name}: ${oldStock} → ${updatedProduct.stock} (change: ${updatedProduct.stock - oldStock})`);
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product (with business access check)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user can access this product
    const canAccess = await canAccessData(req.user._id, product.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
};