// backend/controllers/productController.js
const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a product
const createProduct = async (req, res) => {
  try {
    const { name, category, sku, price, stock, image } = req.body;
    
    const product = await Product.create({
      name,
      category,
      sku,
      price,
      stock,
      image,
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { name, category, sku, price, stock, image } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
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
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product stock
const updateProductStock = async (req, res) => {
  try {
    const { stock, adjustment } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
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
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
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