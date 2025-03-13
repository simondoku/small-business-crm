// src/components/sales/SaleDetails.js
import React, { useState } from 'react';
import { TrashIcon, PlusIcon, MinusIcon, UserIcon } from '@heroicons/react/solid';
import CustomerSelector from './CustomerSelector';

const SaleDetails = ({ 
  saleItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onCompleteSale,
  customer,
  onSelectCustomer,
  onNewCustomer,
  customers = []
}) => {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  // Calculate total
  const total = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Handle customer input change
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle saving new customer
  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      // Check for duplicate before adding
      const existingCustomer = customers.find(c => 
        c.phone === newCustomer.phone || 
        (c.name.toLowerCase() === newCustomer.name.toLowerCase() && 
         (c.address || '').toLowerCase() === (newCustomer.address || '').toLowerCase())
      );
      
      if (existingCustomer) {
        // If customer already exists, select them instead
        onSelectCustomer(existingCustomer);
        alert('This customer already exists in your database. We selected them for you.');
      } else {
        // Add new customer with temporary ID
        const tempCustomer = {
          ...newCustomer,
          _id: `temp-${Date.now()}` // Temporary ID until saved to backend
        };
        onNewCustomer(tempCustomer);
      }
      
      // Reset form and hide it
      setNewCustomer({ name: '', phone: '', address: '' });
      setShowNewCustomerForm(false);
    } else {
      alert('Customer name and phone are required');
    }
  };
  
  // Handle completing the sale
  const handleCompleteSaleClick = () => {
    if (!customer || !customer._id) {
      alert('Please select or add a customer first');
      return;
    }
    
    if (saleItems.length === 0) {
      alert('Please add at least one product to the sale');
      return;
    }
    
    onCompleteSale();
  };
  
  return (
    <div className="bg-dark-500 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-dark-300">
        <h2 className="text-lg font-medium">Sale Details</h2>
        <div className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4">
        {saleItems.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No items added yet.<br />
            Select products from the left panel.
          </div>
        ) : (
          <div className="space-y-3">
            {saleItems.map(item => (
              <div key={item._id} className="bg-dark-400 rounded-lg p-3 flex justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-primary">${item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    className="bg-dark-300 h-8 w-8 rounded-md flex items-center justify-center text-white hover:bg-dark-200"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                    className="bg-dark-300 h-8 w-8 rounded-md flex items-center justify-center text-white hover:bg-dark-200"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item._id)}
                    className="bg-dark-300 h-8 w-8 rounded-md flex items-center justify-center text-white hover:bg-red-500 ml-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Total section */}
      {saleItems.length > 0 && (
        <div className="p-4 border-t border-dark-300">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
      
      {/* Customer section */}
      <div className="p-4 border-t border-dark-300">
        <h3 className="text-sm text-primary uppercase font-medium mb-3">CUSTOMER DETAILS</h3>
        
        {customer ? (
          <div className="bg-dark-400 p-3 rounded-lg mb-3">
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-400">{customer.phone}</div>
            {customer.address && <div className="text-sm text-gray-400">{customer.address}</div>}
            <button 
              onClick={() => onSelectCustomer(null)}
              className="text-primary text-sm mt-2"
            >
              Change Customer
            </button>
          </div>
        ) : (
          <>
            {showNewCustomerForm ? (
              <div className="space-y-3 mb-3">
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleCustomerChange}
                  placeholder="Customer Name"
                  className="w-full p-2 rounded-md bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleCustomerChange}
                  placeholder="Phone Number"
                  className="w-full p-2 rounded-md bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  name="address"
                  value={newCustomer.address}
                  onChange={handleCustomerChange}
                  placeholder="Address (Optional)"
                  className="w-full p-2 rounded-md bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowNewCustomerForm(false)}
                    className="flex-1 py-2 bg-dark-300 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomer}
                    className="flex-1 py-2 bg-primary text-white rounded-md"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCustomerSelector(true)}
                  className="flex-1 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-200 flex items-center justify-center"
                >
                  <UserIcon className="h-5 w-5 mr-1" />
                  Select Existing
                </button>
                <button
                  onClick={() => setShowNewCustomerForm(true)}
                  className="flex-1 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-200 flex items-center justify-center"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add New
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Complete Sale Button */}
      <div className="p-4 border-t border-dark-300">
        <button
          onClick={handleCompleteSaleClick}
          className={`w-full py-3 rounded-lg font-medium ${
            saleItems.length === 0 || !customer
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-opacity-90'
          }`}
        >
          Complete Sale
        </button>
        {saleItems.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-2">Add products to complete sale</div>
        )}
        {!customer && (
          <div className="text-center text-gray-500 text-sm mt-2">Customer information required</div>
        )}
      </div>
      
      {/* Customer selector modal */}
      {showCustomerSelector && (
        <CustomerSelector
          customers={customers}
          selectedCustomer={customer}
          onSelectCustomer={(selectedCustomer) => {
            onSelectCustomer(selectedCustomer);
            setShowCustomerSelector(false);
          }}
          onClose={() => setShowCustomerSelector(false)}
        />
      )}
    </div>
  );
};

export default SaleDetails;