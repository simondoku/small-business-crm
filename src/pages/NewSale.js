// src/pages/NewSale.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import NewSaleForm from '../components/sales/NewSalesForm';
import LoadingScreen from '../components/common/LoadingScreen';
import ToastNotification from '../components/common/ToastNotification';
import { getProducts } from '../services/productService';
import { getCustomers, createCustomer } from '../services/customerService';
import { createSale } from '../services/salesService';
import { ExclamationIcon } from '@heroicons/react/solid';
import { useFocus } from '../context/FocusContext';

const NewSale = () => {
  const navigate = useNavigate();
  const { focusMode, enterFocusMode } = useFocus();
  const [saleItems, setSaleItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [comments, setComments] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockWarnings, setStockWarnings] = useState(null);
  
  // Toast notification state
  const [toast, setToast] = useState(null);
  
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
      // Show toast instead of alert
      setToast({
        type: 'error',
        message: 'Failed to add customer',
        details: 'Please try again or select an existing customer.'
      });
    }
  };
  
  const handleCommentsChange = (newComments) => {
    setComments(newComments);
  };
  
  const handleCompleteSale = async () => {
    if (!selectedCustomer || !selectedCustomer._id) {
      // Show toast instead of alert
      setToast({
        type: 'warning',
        message: 'Customer Required',
        details: 'Please select a customer to complete the sale'
      });
      return;
    }
    
    if (saleItems.length === 0) {
      // Show toast instead of alert
      setToast({
        type: 'warning',
        message: 'No Products Selected',
        details: 'Please add at least one product to the sale'
      });
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
      const response = await createSale(saleData);
      
      // Handle warnings with toast notifications
      if (response.warnings) {
        if (response.warnings.lowStock && response.warnings.lowStock.length > 0) {
          // Format low stock warnings
          const lowStockDetails = response.warnings.lowStock.map(
            p => `${p.name}: Only ${p.stock} left`
          );
          
          setToast({
            type: 'warning',
            message: 'Low Stock Warning',
            details: lowStockDetails,
            duration: 5000
          });
        }
        
        if (response.warnings.soldOut && response.warnings.soldOut.length > 0) {
          // Format sold out warnings
          const soldOutDetails = response.warnings.soldOut.map(
            p => `${p.name} is out of stock`
          );
          
          // Show after a delay if there was already a low stock warning
          setTimeout(() => {
            setToast({
              type: 'warning',
              message: 'Products Out of Stock',
              details: soldOutDetails,
              duration: 5000
            });
          }, response.warnings.lowStock ? 5500 : 0);
        }
      }
      
      // Reset form but stay on the same page
      setSaleItems([]);
      setSelectedCustomer(null);
      setComments('');
      
      // Show success message toast instead of alert
      setTimeout(() => {
        setToast({
          type: 'success',
          message: 'Sale Completed Successfully',
          details: `Total Amount: $${response.sale.totalAmount.toFixed(2)}`,
          duration: 3000
        });
      }, (response.warnings?.lowStock || response.warnings?.soldOut) ? 6000 : 0);
      
      // Refresh product data to ensure we have the latest stock levels
      const refreshedProducts = await getProducts();
      setProducts(refreshedProducts);
    } catch (err) {
      console.error('Error completing sale:', err);
      
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      
      // Show error toast instead of alert
      setToast({
        type: 'error',
        message: 'Failed to Complete Sale',
        details: errorMsg,
        duration: 5000
      });
    }
  };

  // Modified focus mode logic - only prompt once per session
  useEffect(() => {
    // Check if we've already asked about focus mode in this session
    const hasAskedAboutFocusMode = sessionStorage.getItem('hasAskedAboutFocusMode');
    
    // Only suggest focus mode when starting a transaction and haven't asked before
    if (!focusMode && saleItems.length > 0 && !hasAskedAboutFocusMode) {
      const suggestFocusMode = () => {
        if (window.confirm('Would you like to enter focus mode for this transaction?')) {
          enterFocusMode();
        }
        // Remember that we've asked in this session
        sessionStorage.setItem('hasAskedAboutFocusMode', 'true');
      };
      
      suggestFocusMode();
    }
  }, [focusMode, saleItems.length, enterFocusMode]);
  
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
            focusMode={focusMode}
          />
          
          {/* Toast notification */}
          {toast && (
            <ToastNotification
              type={toast.type}
              message={toast.message}
              details={toast.details}
              duration={toast.duration || 3000}
              onClose={() => setToast(null)}
            />
          )}
        </>
      )}
    </MainLayout>
  );
};

export default NewSale;