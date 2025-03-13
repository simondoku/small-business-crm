// src/components/sales/CustomerSelector.js
import React, { useState } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';

const CustomerSelector = ({ 
  customers = [], 
  onSelectCustomer, 
  onClose,
  selectedCustomer = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold">Select Customer</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Search input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search customers..."
              autoFocus
            />
            <div className="absolute left-3 top-2.5">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Customer list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                No customers found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className={`p-3 rounded-lg cursor-pointer flex items-center ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-primary bg-opacity-20 border border-primary'
                        : 'bg-dark-300 hover:bg-dark-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-400">{customer.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-dark-300">
          <button
            onClick={onClose}
            className="w-full py-2 bg-primary text-white rounded-lg"
          >
            {selectedCustomer ? 'Confirm Selection' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSelector;