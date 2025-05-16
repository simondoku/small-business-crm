// src/components/sales/SaleDetails.js
import React, { useState } from 'react';
import { TrashIcon, PlusIcon, MinusIcon, UserIcon, CashIcon, CreditCardIcon } from '@heroicons/react/solid';
import CustomerSelector from './CustomerSelector';

const SaleDetails = ({ 
  saleItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onCompleteSale,
  customer,
  onSelectCustomer,
  onNewCustomer,
  customers = [],
  comments = '',
  onCommentsChange,
  focusMode
}) => {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
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

  // Quick phone number search for focus mode
  const handlePhoneSearch = (e) => {
    e.preventDefault();
    if (!newCustomer.phone) return;

    const existingCustomer = customers.find(c => c.phone === newCustomer.phone);
    if (existingCustomer) {
      onSelectCustomer(existingCustomer);
      setNewCustomer({ name: '', phone: '', address: '' });
    } else {
      setShowNewCustomerForm(true);
    }
  };
  
  return (
    <div className={`${focusMode ? 'bg-dark-600' : 'bg-dark-500'} rounded-lg overflow-hidden h-full flex flex-col transition-all duration-300`}>
      <div className={`p-4 border-b border-dark-300 ${focusMode ? 'bg-primary bg-opacity-5' : ''}`}>
        <h2 className="text-lg font-medium">
          {focusMode ? 'Quick Transaction' : 'Sale Details'}
        </h2>
        <div className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleString()}
        </div>
      </div>
      
      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4">
        {saleItems.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No items added yet.<br />
            {focusMode ? 'Add products from the left panel to begin.' : 'Select products from the left panel.'}
          </div>
        ) : (
          <div className="space-y-3">
            {saleItems.map(item => (
              <div 
                key={item._id} 
                className={`${
                  focusMode ? 'bg-dark-500 border border-dark-300' : 'bg-dark-400'
                } rounded-lg p-3 flex justify-between`}
              >
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-primary">
                    ${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    className={`${
                      focusMode ? 'bg-dark-400' : 'bg-dark-300'
                    } h-8 w-8 rounded-md flex items-center justify-center text-white hover:bg-dark-200`}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className={`w-8 text-center ${focusMode ? 'font-medium' : ''}`}>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                    className={`${
                      focusMode ? 'bg-dark-400' : 'bg-dark-300'
                    } h-8 w-8 rounded-md flex items-center justify-center text-white hover:bg-dark-200`}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item._id)}
                    className={`${
                      focusMode ? 'bg-dark-400' : 'bg-dark-300'
                    } h-8 w-8 rounded-md flex items-center justify-center text-white hover:bg-red-500 ml-2`}
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
        <div className={`p-4 border-t border-dark-300 ${focusMode ? 'bg-dark-500' : ''}`}>
          <div className={`flex justify-between ${focusMode ? 'text-xl' : 'text-lg'} font-semibold`}>
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
          
          {/* Payment method selector - only show in focus mode */}
          {focusMode && (
            <div className="mt-3">
              <div className="text-sm text-primary font-medium mb-2">PAYMENT METHOD</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                    paymentMethod === 'cash' 
                      ? 'bg-primary text-white' 
                      : 'bg-dark-400 text-white'
                  }`}
                >
                  <CashIcon className="h-5 w-5 mr-2" />
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                    paymentMethod === 'card' 
                      ? 'bg-primary text-white' 
                      : 'bg-dark-400 text-white'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Card
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Customer section - simplified in focus mode */}
      <div className={`p-4 border-t border-dark-300 ${focusMode ? 'bg-dark-500' : ''}`}>
        <h3 className="text-sm text-primary uppercase font-medium mb-3">
          {focusMode ? 'CUSTOMER' : 'CUSTOMER DETAILS'}
        </h3>
        
        {customer ? (
          <div className={`${focusMode ? 'bg-dark-500 border border-dark-300' : 'bg-dark-400'} p-3 rounded-lg mb-3`}>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-400">{customer.phone}</div>
            {customer.address && !focusMode && <div className="text-sm text-gray-400">{customer.address}</div>}
            <button 
              onClick={() => onSelectCustomer(null)}
              className="text-primary text-sm mt-2"
            >
              Change Customer
            </button>
          </div>
        ) : focusMode ? (
          <div className="space-y-3 mb-3">
            <form onSubmit={handlePhoneSearch} className="flex">
              <input
                type="text"
                name="phone"
                value={newCustomer.phone}
                onChange={handleCustomerChange}
                placeholder="Phone Number"
                className="flex-1 p-2 rounded-l-md bg-dark-400 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-primary text-white rounded-r-md"
              >
                Find
              </button>
            </form>
            
            {showNewCustomerForm && (
              <>
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleCustomerChange}
                  placeholder="Customer Name"
                  className="w-full p-2 rounded-md bg-dark-400 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleAddCustomer}
                  className="w-full py-2 bg-primary text-white rounded-md"
                >
                  Quick Add Customer
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowCustomerSelector(true)}
              className="w-full py-2 bg-dark-400 text-white rounded-md hover:bg-dark-300 flex items-center justify-center"
            >
              <UserIcon className="h-5 w-5 mr-1" />
              Select Existing Customer
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
        {/* Comments section - simplified in focus mode */}
        {!focusMode && (
          <div className="p-4 border-t border-dark-300">
            <h3 className="text-sm text-primary uppercase font-medium mb-3">SALE COMMENTS</h3>
            <textarea
              placeholder="Add comments about this sale (optional)"
              className="w-full p-2 rounded-md bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              rows="3"
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
            ></textarea>
          </div>
        )}
        
        {/* Quick comment in focus mode */}
        {focusMode && (
          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="Quick note (optional)"
              className="w-full p-2 rounded-md bg-dark-400 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
            />
          </div>
        )}
    
      {/* Complete Sale Button */}
      <div className={`p-4 border-t border-dark-300 ${focusMode ? 'bg-dark-500' : ''}`}>
        <button
          onClick={handleCompleteSaleClick}
          className={`w-full py-3 rounded-lg font-medium ${
            saleItems.length === 0 || !customer
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : focusMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-primary text-white hover:bg-opacity-90'
          } ${focusMode ? 'text-lg' : ''}`}
        >
          {focusMode ? `Complete Sale${paymentMethod === 'cash' ? ' - Cash' : ' - Card'}` : 'Complete Sale'}
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
          focusMode={focusMode}
        />
      )}
    </div>
  );
};

export default SaleDetails;