// src/components/products/ProductList.js
import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  ExclamationIcon,
  PlusSmIcon,
  MinusSmIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/solid';
import { ViewListIcon, ViewGridIcon } from '@heroicons/react/outline';

const ProductList = ({ products = [], onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'table' or 'grid'
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Function to determine stock status indicator
  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return {
        text: 'Out of Stock',
        classes: 'bg-red-500/10 text-red-500 border border-red-500/30',
        icon: <ExclamationIcon className="h-3 w-3 mr-1" />
      };
    } else if (stock <= 5) {
      return {
        text: 'Low Stock',
        classes: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
        icon: <ExclamationIcon className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        text: 'In Stock',
        classes: 'bg-green-500/10 text-green-500 border border-green-500/30',
        icon: null
      };
    }
  };

  const toggleExpand = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Render the table view
  const renderTableView = () => (
    <div className="overflow-x-auto rounded-xl shadow-apple-sm border border-dark-300/30">
      <table className="min-w-full divide-y divide-dark-200/50">
        <thead>
          <tr className="bg-gradient-to-r from-dark-400/70 to-dark-300/70">
            <th className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider">Product</th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider hidden md:table-cell">SKU</th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider">Price</th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider hidden md:table-cell">Status</th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-200/50 bg-dark-400/30 backdrop-blur-sm">
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <svg className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7l8 4 8-4z" />
                  </svg>
                  <p className="text-lg">No products found.</p>
                  <p className="text-sm">Add your first product to get started.</p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              const isExpanded = expandedProductId === product._id;
              
              return (
                <React.Fragment key={product._id || index}>
                  <tr 
                    className={`group hover:bg-dark-300/50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-dark-400/70' : 'bg-dark-500/70'
                    }`}
                    onClick={() => toggleExpand(product._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-dark-200/80 rounded-lg overflow-hidden border border-dark-200/30">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white hidden md:table-cell">
                      {product.sku || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs rounded-md ${
                        product.stock <= 5 ? 'text-yellow-400' : 'text-white'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-medium rounded-full ${stockStatus.classes}`}>
                        {stockStatus.icon}
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(product);
                          }}
                          className="bg-dark-300/80 p-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors border border-dark-200/30"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete && onDelete(product._id);
                          }}
                          className="bg-dark-300/80 p-2 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors border border-dark-200/30"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-dark-300/20 border-t border-dark-200/20">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-xl bg-dark-300/30">
                            <p className="text-xs text-primary mb-2">Stock Management</p>
                            <div className="flex items-center space-x-3">
                              <button className="p-1.5 rounded-md bg-dark-200/80 hover:bg-dark-200 text-gray-300 hover:text-white transition-colors">
                                <MinusSmIcon className="h-4 w-4" />
                              </button>
                              <span className="text-white font-medium">{product.stock} units</span>
                              <button className="p-1.5 rounded-md bg-dark-200/80 hover:bg-dark-200 text-gray-300 hover:text-white transition-colors">
                                <PlusSmIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {product.sku && (
                            <div className="p-3 rounded-xl bg-dark-300/30">
                              <p className="text-xs text-primary mb-2">SKU/ID</p>
                              <p className="text-white text-sm font-mono">{product.sku}</p>
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-dark-300/30">
                            <p className="text-xs text-primary mb-2">Created</p>
                            <p className="text-white text-sm">
                              {product.createdAt 
                                ? new Date(product.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // Render the grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
            <svg className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7l8 4 8-4z" />
            </svg>
            <p className="text-xl">No products found.</p>
            <p className="text-base">Add your first product to get started.</p>
          </div>
        </div>
      ) : (
        products.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          
          return (
            <div 
              key={product._id} 
              className="bg-dark-400/40 backdrop-blur-sm rounded-xl overflow-hidden border border-dark-300/30 hover:border-primary/30 transition-all shadow-apple-sm hover:shadow-apple-md group"
            >
              <div className="h-40 bg-dark-300/50 relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-dark-200/20 to-dark-300/50">
                    <span className="text-gray-400 text-sm">{product.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full backdrop-blur-sm ${stockStatus.classes}`}>
                    {stockStatus.icon}
                    {stockStatus.text}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-white mb-1 text-base">{product.name}</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400 text-xs">{product.category || 'Uncategorized'}</span>
                  <span className="text-primary font-medium">{formatCurrency(product.price)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-dark-200/30">
                  <div className="px-2 py-1 rounded-md bg-dark-300/50 text-xs">
                    <span className={product.stock <= 5 ? 'text-yellow-400' : 'text-gray-300'}>
                      {product.stock} in stock
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => onEdit && onEdit(product)}
                      className="p-1.5 rounded-md bg-dark-300/80 hover:bg-primary/20 hover:text-primary transition-colors"
                      aria-label="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDelete && onDelete(product._id)}
                      className="p-1.5 rounded-md bg-dark-300/80 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="text-primary mr-2">
            {products.length}
          </span> 
          {products.length === 1 ? 'Product' : 'Products'}
        </h2>
        
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">View:</span>
          <div className="flex p-1 bg-dark-300/30 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-gray-400 hover:text-white'}`}
              title="Table View"
              aria-label="Table View"
            >
              <ViewListIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-gray-400 hover:text-white'}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <ViewGridIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'table' ? renderTableView() : renderGridView()}
      
      {products.length > 10 && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex shadow-apple-sm rounded-xl overflow-hidden">
            <button className="px-3 py-2 bg-dark-300/90 text-white border-r border-dark-200/30 hover:bg-dark-200/70 transition-colors">←</button>
            <button className="px-3 py-2 bg-primary text-white">1</button>
            <button className="px-3 py-2 bg-dark-300/90 text-white border-l border-dark-200/30 hover:bg-dark-200/70 transition-colors">→</button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductList;