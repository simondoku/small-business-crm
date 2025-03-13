// src/pages/NewSale.js (updated)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import NewSaleForm from '../components/sales/NewSalesForm';
import { getProducts } from '../services/productService';
import { getCustomers, createCustomer } from '../services/customerService';
import { createSale } from '../services/salesService';

const NewSale = () => {
  const navigate = useNavigate();
  const [saleItems, setSaleItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch products and customers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsData = await getProducts();
        console.log('Fetched products:', productsData);
        setProducts(productsData);
        
        // Fetch customers
        const customersData = await getCustomers();
        console.log('Fetched customers:', customersData);
        setCustomers(customersData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleSelectProduct = (product) => {
    console.log('Selected product:', product);
    // Check if product is already in the sale
    const existingItem = saleItems.find(item => item._id === product._id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      handleUpdateQuantity(product._id, existingItem.quantity + 1);
    } else {
      // Add new item with quantity 1
      setSaleItems([...saleItems, { ...product, quantity: 1 }]);
    }
  };
  
  const handleUpdateQuantity = (productId, newQuantity) => {
    setSaleItems(saleItems.map(item => 
      item._id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const handleRemoveItem = (productId) => {
    setSaleItems(saleItems.filter(item => item._id !== productId));
  };
  
  const handleNewCustomer = async (customerData) => {
    try {
      // If it's a temp ID, we need to create the customer first
      if (customerData._id && customerData._id.startsWith('temp-')) {
        // In a real app, save to database
        const createdCustomer = await createCustomer({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address || ''
        });
        
        // Use the real database customer
        setSelectedCustomer(createdCustomer);
        // Update customers list
        setCustomers([...customers, createdCustomer]);
      } else {
        // Just use the customer as is
        setSelectedCustomer(customerData);
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Failed to add customer. Please try again.');
    }
  };
  
  const handleCompleteSale = async () => {
    if (!selectedCustomer || !selectedCustomer._id) {
      alert('Please select a customer to complete the sale');
      return;
    }
    
    if (saleItems.length === 0) {
      alert('Please add at least one product to the sale');
      return;
    }
    
    try {
      // Format sale data for API
      const saleData = {
        customerId: selectedCustomer._id,
        items: saleItems.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      };
      
      console.log('Submitting sale:', saleData);
      
      // Create the sale through API
      const result = await createSale(saleData);
      console.log('Sale created:', result);
      
      // Reset form
      setSaleItems([]);
      setSelectedCustomer(null);
      
      // Show success message and navigate to dashboard
      alert('Sale completed successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error completing sale:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to complete sale: ${errorMsg}`);
    }
  };
  
  return (
    <MainLayout title="New Sale">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">Loading data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <NewSaleForm
          products={products}
          customers={customers}
          saleItems={saleItems}
          selectedCustomer={selectedCustomer}
          onSelectProduct={handleSelectProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onSelectCustomer={setSelectedCustomer}
          onNewCustomer={handleNewCustomer}
          onCompleteSale={handleCompleteSale}
          loading={loading}
          error={error}
        />
      )}
    </MainLayout>
  );
};

export default NewSale;