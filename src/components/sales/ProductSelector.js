// src/components/sales/ProductSelector.js
import React, { useState, useEffect } from 'react';
import { SearchIcon } from '@heroicons/react/solid';

const ProductSelector = ({ products = [], onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  
  // Set available products and categories when products prop changes
  useEffect(() => {
    if (products && products.length > 0) {
      setAvailableProducts(products);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(products
        .map(p => p.category)
        .filter(category => category && category.trim() !== '')
      )];
      
      setCategories(uniqueCategories);
    }
  }, [products]);
  
  // Filter products based on search and category
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="bg-dark-500 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-dark-300">
        <h2 className="text-lg font-medium">Add Products</h2>
        
        {/* Search bar */}
        <div className="relative mt-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search products..."
          />
          <div className="absolute left-3 top-2.5">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 text-sm rounded-full ${
                activeCategory === category 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-300 text-gray-300 hover:bg-dark-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No products found.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product._id}
              onClick={() => onSelectProduct(product)}
              className="bg-dark-400 rounded-lg p-3 cursor-pointer hover:bg-dark-300 transition-colors"
            >
              <div className="bg-dark-300 h-16 w-16 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-500">No img</span>
                )}
              </div>
              <div className="text-sm font-medium">{product.name}</div>
              <div className="text-primary">${product.price?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;