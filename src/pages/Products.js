// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CubeIcon, ExclamationCircleIcon, RefreshIcon, SearchIcon } from '@heroicons/react/outline';
import MainLayout from '../components/layout/MainLayout';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { 
  getProducts, 
  createProduct, 
  updateProduct,
  updateProductStock,
  deleteProduct 
} from '../services/productService';
import LoadingScreen from '../components/common/LoadingScreen';

const Products = () => {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [forceRefresh]);

  // Check if we should show the form based on navigation state
  useEffect(() => {
    if (location.state?.showForm) {
      handleAddNew();
    }
  }, [location.state]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const uniqueCategories = ['All', ...new Set(products
      .map(p => p.category)
      .filter(category => category && category.trim() !== '')
    )];
    return uniqueCategories;
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async (productData) => {
    try {
      if (productData._id) {
        if ('stockAdjustment' in productData && productData.stockAdjustment !== 0) {
          // Handle stock adjustment
          await updateProductStock(productData._id, {
            adjustment: productData.stockAdjustment
          });
        } else {
          // Normal product update
          await updateProduct(productData._id, productData);
        }
      } else {
        // Add new product
        await createProduct(productData);
      }
      
      // Refresh product list
      setForceRefresh(prev => prev + 1);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setForceRefresh(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleRefresh = () => {
    setForceRefresh(prev => prev + 1);
  };

  if (loading) {
    return <LoadingScreen message="Loading products..." />;
  }

  return (
    <MainLayout 
      title="Products" 
      onAddNew={handleAddNew}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium mb-3 flex items-center">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 flex items-center justify-center mr-3">
            <CubeIcon className="h-6 w-6" />
          </span>
          Product Inventory
        </h1>
        <p className="text-gray-400 ml-1">Manage your products, adjust inventory, and monitor stock levels</p>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-dark-400/30 backdrop-blur-sm border border-dark-300/30 rounded-xl p-4 md:p-5 mb-6 shadow-apple-sm">
        {/* Improved search with animation */}
        <div className="relative mb-5">
          <div className={`flex items-center bg-dark-300/50 rounded-xl px-3 py-2 border transition-all duration-200 ${
            searchFocused ? 'border-primary shadow-sm' : 'border-dark-300/30'
          }`}>
            <SearchIcon className={`h-5 w-5 mr-2 transition-colors ${
              searchFocused ? 'text-primary' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent text-white w-full focus:outline-none placeholder-gray-500"
              placeholder="Search products by name or SKU..."
            />
            {searchTerm && (
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setSearchTerm('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Categories with horizontal scroll on mobile */}
        <div className="flex items-center mb-1">
          <h3 className="text-sm font-medium text-gray-300 mr-3">Categories:</h3>
          <div className="flex-1 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-all ${
                    filterCategory === category 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-dark-300/50 text-gray-300 hover:bg-dark-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            className="ml-2 p-2 rounded-full bg-dark-300/50 text-gray-400 hover:text-white border border-dark-200/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            title="Refresh products"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Results count */}
        <div className="text-xs text-gray-400 mt-3">
          Showing {filteredProducts.length} of {products.length} products
          {searchTerm && <span> matching "{searchTerm}"</span>}
          {filterCategory !== 'All' && <span> in {filterCategory}</span>}
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 shadow-apple-sm">
          <p className="text-red-500 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      ) : (
        <ProductList 
          products={filteredProducts} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      
      {showForm && (
        <ProductForm 
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </MainLayout>
  );
};

export default Products;