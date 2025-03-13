// src/components/dashboard/SalesOverview.js
import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';

const SalesOverview = ({ data = {}, onPeriodChange }) => {
  const [activePeriod, setActivePeriod] = useState('today');
  const [metrics, setMetrics] = useState({
    revenue: 0,
    transactions: 0,
    avgSale: 0,
    newCustomers: 0
  });
  
  // Update metrics when data or period changes
  useEffect(() => {
    // If there's data for the selected period, use it
    if (data[activePeriod]) {
      setMetrics(data[activePeriod]);
    }
  }, [data, activePeriod]);
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };
  
  // Tooltip content
  const tooltipContent = (
    <div>
      <h3 className="font-medium mb-1">Sales Overview</h3>
      <p>This panel displays key sales metrics for the selected time period. Use the toggles to view data for different time ranges.</p>
    </div>
  );
  
  return (
    <div className="bg-dark-400 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Sales Overview</h2>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-primary cursor-pointer" />
        </Tooltip>
      </div>
      
      <div className="p-4 pt-0">
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={() => handlePeriodChange('today')} 
            className={`px-4 py-2 rounded-full text-sm ${
              activePeriod === 'today' ? 'bg-primary text-white' : 'bg-dark-200 text-white hover:bg-dark-100'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => handlePeriodChange('week')} 
            className={`px-4 py-2 rounded-full text-sm ${
              activePeriod === 'week' ? 'bg-primary text-white' : 'bg-dark-200 text-white hover:bg-dark-100'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => handlePeriodChange('month')} 
            className={`px-4 py-2 rounded-full text-sm ${
              activePeriod === 'month' ? 'bg-primary text-white' : 'bg-dark-200 text-white hover:bg-dark-100'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => handlePeriodChange('year')} 
            className={`px-4 py-2 rounded-full text-sm ${
              activePeriod === 'year' ? 'bg-primary text-white' : 'bg-dark-200 text-white hover:bg-dark-100'
            }`}
          >
            Year
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-primary text-sm">REVENUE</p>
            <p className="text-3xl font-bold">${metrics.revenue || 0}</p>
          </div>
          <div>
            <p className="text-primary text-sm">TRANSACTIONS</p>
            <p className="text-3xl font-bold">{metrics.transactions || 0}</p>
          </div>
          <div>
            <p className="text-primary text-sm">AVG SALE</p>
            <p className="text-3xl font-bold">${metrics.avgSale ? metrics.avgSale.toFixed(2) : '0.00'}</p>
          </div>
          <div>
            <p className="text-primary text-sm">NEW CUSTOMERS</p>
            <p className="text-3xl font-bold">{metrics.newCustomers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;