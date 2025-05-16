// src/components/sales/ProductSelector.js
import React, { useState, useEffect } from 'react';
import { SearchIcon, SortAscendingIcon, CurrencyDollarIcon, StarIcon, InformationCircleIcon } from '@heroicons/react/solid';

const ProductSelector = ({ products = [], onSelectProduct, focusMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'popular'
  const [activeDescription, setActiveDescription] = useState(null);
  
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
  
  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'price') {
      return a.price - b.price;
    }
    if (sortBy === 'popular') {
      // Assuming products have a popularity field or using stock as a proxy
      return (b.popularity || 0) - (a.popularity || 0);
    }
    return 0;
  });

  // Clear search when category changes
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (focusMode) {
      setSearchTerm(''); // Clear search in focus mode for faster category switching
    }
  };

  // Toggle product description
  const toggleDescription = (e, productId) => {
    e.stopPropagation(); // Prevent selecting the product when clicking the info icon
    setActiveDescription(activeDescription === productId ? null : productId);
  };
  
  return (
    <div className={`${focusMode ? 'bg-dark-600' : 'bg-dark-500'} rounded-lg overflow-hidden h-full flex flex-col transition-all duration-300`}>
      <div className={`p-4 border-b border-dark-300 ${focusMode ? 'bg-primary bg-opacity-5' : ''}`}>
        <h2 className="text-lg font-medium">
          {focusMode ? 'Quick Product Selection' : 'Add Products'}
        </h2>
        
        {/* Search bar */}
        <div className="relative mt-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${focusMode ? 'bg-dark-500 ring-1 ring-primary' : 'bg-dark-300'} text-white focus:outline-none focus:ring-1 focus:ring-primary`}
            placeholder="Search products..."
            autoFocus={focusMode}
          />
          <div className="absolute left-3 top-2.5">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Sort options - only show in focus mode */}
        {focusMode && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSortBy('name')}
              className={`flex items-center px-3 py-1.5 text-xs rounded-full ${
                sortBy === 'name' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-400 text-gray-300 hover:bg-dark-300'
              }`}
            >
              <SortAscendingIcon className="h-4 w-4 mr-1" />
              Name
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`flex items-center px-3 py-1.5 text-xs rounded-full ${
                sortBy === 'price' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-400 text-gray-300 hover:bg-dark-300'
              }`}
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Price
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center px-3 py-1.5 text-xs rounded-full ${
                sortBy === 'popular' 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-400 text-gray-300 hover:bg-dark-300'
              }`}
            >
              <StarIcon className="h-4 w-4 mr-1" />
              Popular
            </button>
          </div>
        )}
        
        {/* Category filters - scrollable in focus mode */}
        <div className={`flex mt-3 ${focusMode ? 'overflow-x-auto pb-2 no-scrollbar' : 'flex-wrap'} gap-2`}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap ${
                activeCategory === category 
                  ? 'bg-primary text-white' 
                  : `${focusMode ? 'bg-dark-400' : 'bg-dark-300'} text-gray-300 hover:bg-dark-200`
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
      ) : sortedProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No products found.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className={`p-4 grid ${
            focusMode ? 'grid-cols-3 gap-3' : 'grid-cols-2 gap-4'
          }`}>
            {sortedProducts.map(product => (
              <div 
                key={product._id}
                className={`${
                  focusMode 
                    ? 'bg-dark-500 hover:bg-primary hover:bg-opacity-10' 
                    : 'bg-dark-400 hover:bg-dark-300'
                } rounded-lg overflow-hidden transition-colors flex flex-col hover:shadow-lg border border-transparent hover:border-primary-500/30 relative`}
              >
                {/* Clickable container */}
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="cursor-pointer flex flex-col flex-1"
                >
                  {/* Image container taking up 2/3 of the card height */}
                  <div className={`w-full ${focusMode ? 'h-32' : 'h-40'} bg-dark-300 flex items-center justify-center overflow-hidden relative`}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-dark-300">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    
                    {/* Stock indicator overlay */}
                    {product.stock <= 5 && (
                      <div className="absolute top-2 right-2">
                        {product.stock > 0 ? (
                          <span className="text-yellow-300 bg-dark-500/80 px-2 py-0.5 rounded-full text-xs font-medium">
                            {product.stock} left
                          </span>
                        ) : (
                          <span className="text-red-400 bg-dark-500/80 px-2 py-0.5 rounded-full text-xs font-medium">
                            Out of stock
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product info section at bottom */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-white truncate pr-6">
                        {product.name}
                      </div>
                      {product.description && (
                        <button 
                          onClick={(e) => toggleDescription(e, product._id)}
                          className={`absolute top-3 right-3 p-1 rounded-full ${activeDescription === product._id ? 'bg-primary text-white' : 'bg-dark-300/50 text-white/70 hover:bg-dark-300'}`}
                        >
                          <InformationCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="text-primary font-bold text-lg mt-1">
                      ${product.price?.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Description panel - shows when active */}
                {activeDescription === product._id && product.description && (
                  <div className="p-3 bg-dark-300 border-t border-dark-200/30 slide-up">
                    <h4 className="font-medium text-sm text-primary mb-1">Description</h4>
                    <p className="text-sm text-white/90">{product.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;