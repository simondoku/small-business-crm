// src/components/dashboard/QuickActionMenu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon, ShoppingCartIcon, CubeIcon, UsersIcon } from '@heroicons/react/solid';

const QuickActionMenu = ({ onClose }) => {
  const navigate = useNavigate();

  const handleAction = (action) => {
    switch (action) {
      case 'new-sale':
        navigate('/sales');
        break;
      case 'new-product':
        navigate('/products', { state: { showForm: true } });
        break;
      case 'new-customer':
        navigate('/customers', { state: { showForm: true } });
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-dark-400 rounded-lg w-64 shadow-lg">
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-2">
          <button
            onClick={() => handleAction('new-sale')}
            className="w-full flex items-center p-3 rounded-lg hover:bg-dark-300 text-left"
          >
            <ShoppingCartIcon className="h-5 w-5 text-primary mr-3" />
            <span>New Sale</span>
          </button>
          
          <button
            onClick={() => handleAction('new-product')}
            className="w-full flex items-center p-3 rounded-lg hover:bg-dark-300 text-left"
          >
            <CubeIcon className="h-5 w-5 text-primary mr-3" />
            <span>Add Product</span>
          </button>
          
          <button
            onClick={() => handleAction('new-customer')}
            className="w-full flex items-center p-3 rounded-lg hover:bg-dark-300 text-left"
          >
            <UsersIcon className="h-5 w-5 text-primary mr-3" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionMenu;