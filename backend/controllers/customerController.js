// backend/controllers/customerController.js
const Customer = require('../models/Customer');
const { getBusinessOwner, canAccessData } = require('../utils/businessUtils');

// Get all customers (filtered by business)
const getCustomers = async (req, res) => {
  try {
    // Get the business owner for the current user
    const businessOwner = await getBusinessOwner(req.user._id);
    
    // Only get customers created by users in the same business
    const customers = await Customer.find({ createdBy: businessOwner }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get customer by ID (with business access check)
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if user can access this customer
    const canAccess = await canAccessData(req.user._id, customer.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a customer (with business ownership)
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    // Get the business owner for the current user
    const businessOwner = await getBusinessOwner(req.user._id);
    
    // Check if phone number already exists within this business
    const existingCustomer = await Customer.findOne({ 
      phone, 
      createdBy: businessOwner 
    });
    if (existingCustomer) {
      return res.status(400).json({ message: 'A customer with this phone number already exists in your business' });
    }
    
    const customer = new Customer({
      name,
      phone,
      email,
      address,
      totalPurchases: 0,
      createdBy: businessOwner, // Assign to business owner
      createdAt: new Date()
    });
    
    const savedCustomer = await customer.save();
    
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a customer (with business access check)
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if user can access this customer
    const canAccess = await canAccessData(req.user._id, customer.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if the phone number is being changed and already exists within this business
    if (phone !== customer.phone) {
      const businessOwner = await getBusinessOwner(req.user._id);
      const existingCustomer = await Customer.findOne({ 
        phone, 
        createdBy: businessOwner 
      });
      if (existingCustomer) {
        return res.status(400).json({ message: 'A customer with this phone number already exists in your business' });
      }
    }
    
    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.email = email || customer.email;
    customer.address = address || customer.address;
    
    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a customer (with business access check)
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if user can access this customer
    const canAccess = await canAccessData(req.user._id, customer.createdBy);
    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};