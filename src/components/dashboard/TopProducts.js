// src/components/dashboard/TopProducts.js
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';

const TopProducts = ({ products = [] }) => {
  // If no products provided, use sample data
  const displayProducts = products.length > 0 ? products : [
    { name: 'Product A', count: 32 },
    { name: 'Product B', count: 24 },
    { name: 'Product C', count: 18 },
    { name: 'Product D', count: 12 }
  ];
  
  // Find the max count for percentage calculation
  const maxCount = Math.max(...displayProducts.map(p => p.count), 1);
  
  // Tooltip content
  const tooltipContent = (
    <div>
      <h3 className="font-medium mb-1">Top Products</h3>
      <p>This panel shows your best-selling products based on quantity sold.</p>
    </div>
  );
  
  return (
    <div className="bg-dark-400 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Top Products</h2>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-primary cursor-pointer" />
        </Tooltip>
      </div>
      
      <div className="p-4 pt-0">
        {displayProducts.map((product, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span>{product.name}</span>
              <span>{product.count}</span>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${(product.count / maxCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;