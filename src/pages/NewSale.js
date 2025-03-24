// src/pages/NewSale.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import NewSaleForm from '../components/sales/NewSalesForm';
import LoadingScreen from '../components/common/LoadingScreen';
import { getProducts } from '../services/productService';
import { getCustomers, createCustomer } from '../services/customerService';
import { createSale } from '../services/salesService';
import { ExclamationIcon } from '@heroicons/react/solid';

const NewSale = () => {
  const navigate = useNavigate();
  const [saleItems, setSaleItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [comments, setComments] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockWarnings, setStockWarnings] = useState(null);
  
  // Fetch products and customers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsData = await getProducts();
        setProducts(productsData);
        
        // Fetch customers
        const customersData = await getCustomers();
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
    // Check if product is already in the sale
    const existingItem = saleItems.find(item => item._id === product._id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      handleUpdateQuantity(product._id, existingItem.quantity + 1);
    } else {
      // Add new item with quantity 1
      setSaleItems([...saleItems, { ...product, quantity: 1 }]);
    }

    // Check for low stock warning
    if (product.stock <= 5 && product.stock > 0) {
      setStockWarnings({
        type: 'low',
        product: product.name,
        stock: product.stock
      });
    }
  };
  
  const handleUpdateQuantity = (productId, newQuantity) => {
    // Get the product to check stock
    const product = products.find(p => p._id === productId);
    
    // Don't allow quantity higher than stock unless stock is already 0
    if (product.stock > 0 && newQuantity > product.stock) {
      setStockWarnings({
        type: 'insufficient',
        product: product.name,
        stock: product.stock,
        requested: newQuantity
      });
      return;
    }
    
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
  
  const handleCommentsChange = (newComments) => {
    setComments(newComments);
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
        })),
        comments: comments
      };
      
      // Create the sale through API
      const result = await createSale(saleData);
      
      // Check for warnings
      if (result.warnings) {
        if (result.warnings.lowStock) {
          alert(`Warning: Low stock for the following products:\n${
            result.warnings.lowStock.map(p => `${p.name}: Only ${p.stock} left`).join('\n')
          }`);
        }
        
        if (result.warnings.soldOut) {
          alert(`The following products are out of stock:\n${
            result.warnings.soldOut.map(p => p.name).join('\n')
          }`);
        }
      }
      
      // Reset form
      setSaleItems([]);
      setSelectedCustomer(null);
      setComments('');
      
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
        <>
          {stockWarnings && (
            <div className="mb-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4 flex items-start">
              <ExclamationIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-500">Stock Warning</h3>
                {stockWarnings.type === 'low' && (
                  <p className="text-sm text-yellow-500">
                    Low stock for {stockWarnings.product}: Only {stockWarnings.stock} units left.
                  </p>
                )}
                {stockWarnings.type === 'insufficient' && (
                  <p className="text-sm text-yellow-500">
                    Insufficient stock for {stockWarnings.product}. Available: {stockWarnings.stock}, Requested: {stockWarnings.requested}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setStockWarnings(null)} 
                className="ml-auto text-yellow-500 hover:text-yellow-700"
              >
                Dismiss
              </button>
            </div>
          )}
          
          <NewSaleForm
            products={products}
            customers={customers}
            saleItems={saleItems}
            selectedCustomer={selectedCustomer}
            comments={comments}
            onSelectProduct={handleSelectProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onSelectCustomer={setSelectedCustomer}
            onNewCustomer={handleNewCustomer}
            onCommentsChange={handleCommentsChange}
            onCompleteSale={handleCompleteSale}
            loading={loading}
            error={error}
          />
        </>
      )}
    </MainLayout>
  );
};

export default NewSale;