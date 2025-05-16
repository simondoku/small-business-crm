// src/components/dashboard/SalesOverview.js
import React, { useState, useEffect } from 'react';
import { InformationCircleIcon, CashIcon, ShoppingCartIcon, TrendingUpIcon, UserAddIcon } from '@heroicons/react/outline';
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
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="card shadow-apple-md border border-dark-300/30">
      <div className="p-5 flex justify-between items-center border-b border-dark-300/20">
        <h2 className="text-lg font-medium">Sales Overview</h2>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </Tooltip>
      </div>
      
      <div className="p-5">
        <div className="inline-flex p-1 bg-dark-300/50 rounded-xl mb-6 backdrop-blur-sm">
          <button 
            onClick={() => handlePeriodChange('today')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activePeriod === 'today' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-dark-200/50'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => handlePeriodChange('week')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activePeriod === 'week' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-dark-200/50'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => handlePeriodChange('month')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activePeriod === 'month' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-dark-200/50'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => handlePeriodChange('year')} 
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activePeriod === 'year' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-300 hover:text-white hover:bg-dark-200/50'
            }`}
          >
            Year
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="group p-4 bg-dark-300/30 rounded-xl hover:bg-dark-300/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
              <CashIcon className="h-5 w-5" />
            </div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(metrics.revenue || 0)}</p>
          </div>
          
          <div className="group p-4 bg-dark-300/30 rounded-xl hover:bg-dark-300/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
              <ShoppingCartIcon className="h-5 w-5" />
            </div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Transactions</p>
            <p className="text-2xl font-bold">{metrics.transactions || 0}</p>
          </div>
          
          <div className="group p-4 bg-dark-300/30 rounded-xl hover:bg-dark-300/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <TrendingUpIcon className="h-5 w-5" />
            </div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Avg Sale</p>
            <p className="text-2xl font-bold">{formatCurrency(metrics.avgSale || 0)}</p>
          </div>
          
          <div className="group p-4 bg-dark-300/30 rounded-xl hover:bg-dark-300/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <UserAddIcon className="h-5 w-5" />
            </div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">New Customers</p>
            <p className="text-2xl font-bold">{metrics.newCustomers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;