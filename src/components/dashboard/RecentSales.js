// src/components/dashboard/RecentSales.js
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';

const RecentSales = ({ sales = [] }) => {
  // If no sales provided, use sample data
  const displaySales = sales.length > 0 ? sales : [
    { customer: 'John Smith', product: 'Product A', amount: 59.99, time: '10:24', date: '03/12/2025' },
    { customer: 'Mary Johnson', product: 'Product C', amount: 45.50, time: '11:15', date: '03/12/2025' },
    { customer: 'David Miller', product: 'Product B', amount: 34.99, time: '12:03', date: '03/12/2025' },
    { customer: 'Sarah Brown', product: 'Product A', amount: 59.99, time: '13:42', date: '03/12/2025' },
    { customer: 'Kevin Lee', product: 'Product D', amount: 22.75, time: '14:17', date: '03/12/2025' }
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