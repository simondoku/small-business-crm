// src/pages/Customers.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import CustomerList from '../components/customers/CustomerList';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerDetail from '../components/customers/CustomerDetail';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer,
  deleteCustomer 
} from '../services/customerService';

const Customers = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Please try again.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Check if we should show the form based on navigation state
  useEffect(() => {
    if (location.state?.showForm) {
      handleAddNew();
    }
  }, [location.state]);

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleSave = async (customerData) => {
    try {
      if (customerData._id) {
        // Update existing customer
        const updatedCustomer = await updateCustomer(customerData._id, customerData);
        setCustomers(customers.map(c => 
          c._id === updatedCustomer._id ? { ...c, ...updatedCustomer } : c
        ));
      } else {
        // Add new customer
        const newCustomer = await createCustomer(customerData);
        setCustomers([...customers, newCustomer]);
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await deleteCustomer(customerId);
      setCustomers(customers.filter(c => c._id !== customerId));
      setShowDetail(false);
      alert('Customer deleted successfully');
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <MainLayout 
      title="Customers" 
      onAddNew={handleAddNew}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <CustomerList 
          customers={customers} 
          onEdit={handleViewDetail}
          onDelete={handleDelete}
        />
      )}
      
      {showForm && (
        <CustomerForm 
          customer={selectedCustomer}
          onSave={handleSave}
          onCancel={handleCancelForm}
          customers={customers}
        />
      )}
      
      {showDetail && !showForm && (
        <CustomerDetail 
          customer={selectedCustomer}
          onClose={() => setShowDetail(false)}
          onEdit={() => handleEdit(selectedCustomer)}
          onDelete={handleDelete}
        />
      )}
    </MainLayout>
  );
};

export default Customers;