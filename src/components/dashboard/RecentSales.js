// src/components/dashboard/RecentSales.js
import React from 'react';
import { InformationCircleIcon, ClockIcon, UserIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';

const RecentSales = ({ sales = [] }) => {
  // If no sales provided, use sample data
  const displaySales = sales.length > 0 ? sales : [
    { customer: 'Sample Customer', product: 'Sample Product', amount: 0, time: '00:00', date: '00/00/0000' },
  ];
  
  // Tooltip content
  const tooltipContent = (
    <div>
      <h3 className="font-medium mb-1">Recent Sales</h3>
      <p>This panel displays your most recent transactions in chronological order.</p>
    </div>
  );
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="card shadow-apple border border-dark-300/30">
      <div className="p-5 flex justify-between items-center border-b border-dark-300/20">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-primary-400 mr-2" />
          <h2 className="text-lg font-medium">Recent Sales</h2>
        </div>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </Tooltip>
      </div>
      
      <div className="p-5">
        {displaySales.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No recent sales available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displaySales.map((sale, index) => (
              <div 
                key={index} 
                className="group p-3 rounded-lg bg-dark-300/30 hover:bg-dark-300/50 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{sale.customer}</h3>
                      <p className="text-sm text-gray-400">{sale.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(sale.amount)}</p>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-end">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mr-1"></span>
                      <span>{sale.time} • {sale.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {sales.length > 0 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              View All Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSales;