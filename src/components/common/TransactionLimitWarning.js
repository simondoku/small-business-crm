// src/components/common/TransactionLimitWarning.js
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCardIcon, ExclamationCircleIcon } from '@heroicons/react/solid';

const TransactionLimitWarning = () => {
  const transactionCount = localStorage.getItem('transactionCount') || '20+';
  const transactionLimit = localStorage.getItem('transactionLimit') || '20';
  
  return (
    <div className="bg-dark-400 border-2 border-primary rounded-lg p-6 mx-auto max-w-3xl my-8 text-center">
      <div className="flex flex-col items-center">
        <div className="flex-shrink-0 bg-primary rounded-full p-3 mb-4">
          <ExclamationCircleIcon className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Transaction Limit Reached</h2>
        
        <p className="text-gray-300 mb-6 max-w-lg">
          You've used <span className="text-primary font-medium">{transactionCount}</span> of your <span className="text-primary font-medium">{transactionLimit}</span> free transactions. 
          Upgrade to Premium to process unlimited sales.
        </p>
        
        <div className="bg-dark-500 rounded-lg p-5 mb-6 w-full max-w-md">
          <h3 className="text-lg font-medium mb-3 text-primary">Premium Benefits:</h3>
          <ul className="text-left space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Unlimited sales transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Advanced analytics and reports</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">✓</span>
              <span>Priority support</span>
            </li>
          </ul>
          <p className="text-sm text-gray-400">
            Just $20/month - cancel anytime
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link
            to="/payments/subscription"
            className="btn btn-primary px-6 py-3 font-medium flex items-center"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Upgrade to Premium
          </Link>
          <Link
            to="/dashboard"
            className="btn btn-secondary px-6 py-3 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TransactionLimitWarning;
