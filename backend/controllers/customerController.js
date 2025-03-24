// backend/controllers/customerController.js
const Customer = require('../models/Customer');

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 }); // Sort by newest first
    res.json(customers);
  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a customer
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    // Check if phone number already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ message: 'A customer with this phone number already exists' });
    }
    
    const customer = new Customer({
      name,
      phone,
      email,
      address,
      totalPurchases: 0,
      // Ensure createdAt is explicitly set to now
      createdAt: new Date()
    });
    
    const savedCustomer = await customer.save();
    console.log('Customer created:', savedCustomer);
    
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a customer
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (customer) {
      // Check if the phone number is being changed and already exists
      if (phone !== customer.phone) {
        const existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
          return res.status(400).json({ message: 'A customer with this phone number already exists' });
        }
      }
      
      customer.name = name || customer.name;
      customer.phone = phone || customer.phone;
      customer.email = email || customer.email;
      customer.address = address || customer.address;
      
      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (customer) {
      await customer.deleteOne();
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
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