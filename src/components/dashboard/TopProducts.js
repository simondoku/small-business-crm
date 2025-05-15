// src/components/dashboard/TopProducts.js
import React from 'react';
import { InformationCircleIcon, StarIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';

const TopProducts = ({ products = [] }) => {
  // If no products provided, use sample data
  const displayProducts = products.length > 0 ? products : [
    { name: 'Sample Product', count: 0 },
  ];
  
  // Find the max count for percentage calculation
  const maxCount = Math.max(...displayProducts.map(p => p.count), 1);
  
  // Generate gradient colors for bars
  const gradientColors = [
    'from-primary-500 to-purple-600',
    'from-purple-500 to-blue-600',
    'from-blue-500 to-green-600',
    'from-green-500 to-yellow-600'
  ];
  
  // Tooltip content
  const tooltipContent = (
    <div>
      <h3 className="font-medium mb-1">Top Products</h3>
      <p>This panel shows your best-selling products based on quantity sold.</p>
    </div>
  );
  
  return (
    <div className="card shadow-apple border border-dark-300/30">
      <div className="p-5 flex justify-between items-center border-b border-dark-300/20">
        <div className="flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-medium">Top Products</h2>
        </div>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </Tooltip>
      </div>
      
      <div className="p-5 space-y-5">
        {displayProducts.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No product data available</p>
          </div>
        ) : (
          displayProducts.map((product, index) => (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-dark-300/70 flex items-center justify-center text-xs font-medium mr-2.5">
                    {index + 1}
                  </span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <span className="bg-dark-300/50 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {product.count} sold
                </span>
              </div>
              <div className="w-full bg-dark-300/30 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${gradientColors[index % gradientColors.length]} h-2 rounded-full transition-all duration-700`} 
                  style={{ width: `${Math.max((product.count / maxCount) * 100, 5)}%` }}
                ></div>
              </div>
            </div>
          ))
        )}

        {displayProducts.length < 3 && (
          <div className="text-center py-2 text-sm text-gray-500 italic">
            Start selling more products to see your top performers here.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProducts;