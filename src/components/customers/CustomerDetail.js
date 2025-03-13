// src/components/customers/CustomerDetail.js
import React from 'react';
import { XIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/solid';

const CustomerDetail = ({ customer, onClose, onEdit, onDelete }) => {
  if (!customer) return null;
  
  // Format purchase history
  const purchases = customer.purchases || [];
  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-medium mr-4">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-medium">{customer.name}</h3>
              <p className="text-gray-400">{customer.phone}</p>
              {customer.email && <p className="text-gray-400">{customer.email}</p>}
            </div>
          </div>
          
          {customer.address && (
            <div className="mb-4 p-3 bg-dark-300 rounded-lg">
              <h4 className="text-sm text-primary font-medium mb-1">Address</h4>
              <p className="text-white">{customer.address}</p>
            </div>
          )}
          
          <div className="mb-4 p-3 bg-dark-300 rounded-lg">
            <h4 className="text-sm text-primary font-medium mb-1">Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-400">Total Spent</p>
                <p className="font-medium">${totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="font-medium">{purchases.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Customer Since</p>
                <p className="font-medium">{customer.createdAt || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Purchase</p>
                <p className="font-medium">{customer.lastPurchaseDate || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {purchases.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm text-primary font-medium mb-2">Recent Purchases</h4>
              <div className="max-h-40 overflow-y-auto">
                {purchases.slice(0, 5).map((purchase, index) => (
                  <div key={index} className="p-2 bg-dark-300 rounded mb-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{purchase.date}</span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-primary mr-1" />
                      <span>${purchase.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-dark-300 flex justify-between">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this customer?')) {
                onDelete(customer._id);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Customer
          </button>
          
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
          >
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;