// src/components/customers/CustomerForm.js
import React, { useState, useEffect } from 'react';
import { XIcon } from '@heroicons/react/solid';

const CustomerForm = ({ customer = null, onSave, onCancel, customers = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  // If customer is provided, populate form for editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        email: customer.email || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Check for duplicates
    if (formData.phone && !customer?.id) {
      const duplicate = customers.find(c => c.phone === formData.phone);
      if (duplicate) {
        newErrors.phone = 'This phone number is already registered';
      }
    }
    
    // If editing, only check for duplicates with other customers
    if (formData.phone && customer?.id) {
      const duplicate = customers.find(c => c.phone === formData.phone && c.id !== customer.id);
      if (duplicate) {
        newErrors.phone = 'This phone number is already registered';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // If editing, pass the id
    if (customer && customer.id) {
      onSave({ ...formData, id: customer.id });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none ${
                errors.name ? 'border border-red-500' : 'focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none ${
                errors.phone ? 'border border-red-500' : 'focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 bg-dark-200 text-white rounded-md hover:bg-dark-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
            >
              {customer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;