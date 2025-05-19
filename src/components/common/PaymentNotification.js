// src/components/common/PaymentNotification.js
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCardIcon, XIcon } from '@heroicons/react/solid';

/**
 * Payment notification component that shows when users reach transaction limit
 */
const PaymentNotification = ({ onClose }) => {
  const transactionCount = localStorage.getItem('transactionCount') || '20+';
  const transactionLimit = localStorage.getItem('transactionLimit') || '20';
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-lg bg-gradient-to-r from-primary-800 to-primary-600 text-white shadow-lg shadow-primary-600/20 animate-slide-up p-0.5">
      <div className="flex bg-dark-500 rounded-md p-4">
        <div className="flex-shrink-0 bg-primary rounded-full p-2 mr-3">
          <CreditCardIcon className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">Transaction Limit Reached</h3>
            <button 
              onClick={onClose}
              className="text-gray-300 hover:text-white"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          <p className="mt-1 text-sm text-gray-200">
            You've used {transactionCount} of your {transactionLimit} free transactions. 
            Upgrade your account to continue using all features.
          </p>
          
          <div className="mt-3 flex gap-3">
            <Link
              to="/payments/upgrade"
              className="px-4 py-2 bg-primary hover:bg-primary-700 rounded text-sm font-medium transition-colors"
            >
              Upgrade Now
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-400 hover:bg-dark-300 rounded text-sm transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentNotification;