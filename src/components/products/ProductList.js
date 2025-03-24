// src/components/products/ProductList.js
import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/solid';

const ProductList = ({ products = [], onEdit, onDelete }) => {
  // Function to determine stock status indicator
  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return {
        text: 'Out of Stock',
        classes: 'bg-red-100 text-red-800'
      };
    } else if (stock <= 5) {
      return {
        text: 'Low Stock',
        classes: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return {
        text: 'In Stock',
        classes: 'bg-green-100 text-green-800'
      };
    }
  };

  return (
    <div className="bg-dark-400 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-dark-300">
        <div>
          <h2 className="text-lg font-medium">All Products ({products.length})</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              className="pl-3 pr-10 py-2 rounded-lg bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search products..."
            />
            <div className="absolute right-3 top-2.5">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-200">
          <thead className="bg-dark-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">SKU/ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-200">
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr key={product._id || index} className={index % 2 === 0 ? 'bg-dark-400' : 'bg-dark-500'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-dark-200 rounded-md overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-gray-500">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${product.price?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.classes}`}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onEdit && onEdit(product)}
                        className="bg-dark-200 p-2 rounded-md hover:bg-dark-100"
                      >
                        <PencilIcon className="h-4 w-4 text-white" />
                      </button>
                      <button 
                        onClick={() => onDelete && onDelete(product._id)}
                        className="bg-dark-200 p-2 rounded-md hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex justify-between items-center bg-dark-300">
        <div className="text-sm text-gray-400">Showing 1-{products.length} of {products.length} products</div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded bg-dark-200 text-white">←</button>
          <button className="px-3 py-1 rounded bg-primary text-white">1</button>
          <button className="px-3 py-1 rounded bg-dark-200 text-white">→</button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;