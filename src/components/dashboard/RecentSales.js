// src/components/dashboard/RecentSales.js
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';
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
  
  return (
    <div className="bg-dark-400 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Recent Sales</h2>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-primary cursor-pointer" />
        </Tooltip>
      </div>
      
      <div className="p-4 pt-0">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-xs text-primary text-left pb-2">CUSTOMER</th>
              <th className="text-xs text-primary text-left pb-2">PRODUCT</th>
              <th className="text-xs text-primary text-left pb-2">AMOUNT</th>
              <th className="text-xs text-primary text-left pb-2">DATE</th>
              <th className="text-xs text-primary text-left pb-2">TIME</th>
            </tr>
          </thead>
          <tbody>
            {displaySales.map((sale, index) => (
              <tr key={index} className={index % 2 === 0 ? '' : 'bg-dark-300 bg-opacity-30'}>
                <td className="py-2">{sale.customer}</td>
                <td className="py-2">{sale.product}</td>
                <td className="py-2">${sale.amount.toFixed(2)}</td>
                <td className="py-2">{sale.date}</td>
                <td className="py-2">{sale.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSales;