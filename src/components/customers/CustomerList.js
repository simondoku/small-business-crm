// src/components/customers/CustomerList.js
import React, { useState } from 'react';
import { SearchIcon, PencilIcon, TrashIcon, PhoneIcon, LocationMarkerIcon } from '@heroicons/react/solid';

const CustomerList = ({ customers = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="bg-dark-400 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-dark-300">
        <div>
          <h2 className="text-lg font-medium">All Customers ({filteredCustomers.length})</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search customers..."
            />
            <div className="absolute left-3 top-2.5">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          No customers match your search
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredCustomers.map(customer => (
            <div key={customer._id} className="bg-dark-300 rounded-lg p-4 relative">
              <div className="absolute top-3 right-3 flex space-x-2">
                <button 
                  onClick={() => onEdit && onEdit(customer)}
                  className="bg-dark-200 p-2 rounded-md hover:bg-dark-100"
                >
                  <PencilIcon className="h-4 w-4 text-white" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this customer?')) {
                      onDelete && onDelete(customer._id);
                    }
                  }}
                  className="bg-dark-200 p-2 rounded-md hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium mr-3">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{customer.name}</h3>
                  <div className="flex items-center text-gray-400 text-sm">
                    <PhoneIcon className="h-3 w-3 mr-1" />
                    {customer.phone}
                  </div>
                </div>
              </div>
              
              {customer.address && (
                <div className="flex items-center text-gray-400 text-sm">
                  <LocationMarkerIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>{customer.address}</span>
                </div>
              )}
              
              {customer.totalPurchases > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-200">
                  <div className="flex justify-between text-sm">
                    <span>Total Purchases</span>
                    <span className="text-primary font-medium">${customer.totalPurchases.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Last Purchase</span>
                    <span>{new Date(customer.lastPurchaseDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerList;