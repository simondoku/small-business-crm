// backend/controllers/customerController.js
const Customer = require('../models/Customer');

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
};

// Create a customer
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
      totalPurchases: 0,
    });
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a customer
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (customer) {
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