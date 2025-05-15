// src/components/products/ProductForm.js
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, PhotographIcon, PlusIcon, MinusIcon } from '@heroicons/react/solid';
import { ChevronDownIcon } from '@heroicons/react/outline';

const ProductForm = ({ product = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    price: '',
    stock: '',
    stockAdjustment: 0, // New field for stock adjustments
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [adjustingStock, setAdjustingStock] = useState(false); // Mode for stock adjustment
  const [focusedField, setFocusedField] = useState(null);
  const modalRef = useRef(null);
  
  // Handle click outside for mobile
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Optional: Close on outside click (mobile UX)
        // onCancel();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, onCancel]);

  // If product is provided, populate form for editing
  useEffect(() => {
    if (product) {
      setFormData({
        _id: product._id, // Include MongoDB _id
        name: product.name || '',
        category: product.category || '',
        sku: product.sku || '',
        price: product.price ? product.price.toString() : '',
        stock: product.stock ? product.stock.toString() : '',
        stockAdjustment: 0,
        image: product.image || null
      });
      
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockAdjustment = (amount) => {
    setFormData(prev => {
      const adjustment = prev.stockAdjustment ? parseInt(prev.stockAdjustment) : 0;
      return { ...prev, stockAdjustment: adjustment + amount };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStockMode = () => {
    setAdjustingStock(!adjustingStock);
    setFormData(prev => ({ ...prev, stockAdjustment: 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert price and stock to numbers
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price),
      // If we're in stock adjustment mode, calculate the new total
      stock: adjustingStock 
        ? parseInt(formData.stock) + parseInt(formData.stockAdjustment)
        : parseInt(formData.stock)
    };
    
    onSave(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div 
        ref={modalRef} 
        className="bg-dark-400 rounded-2xl w-full max-w-md mx-auto shadow-apple-lg border border-dark-300/50 overflow-hidden animate-scale-in"
        style={{maxHeight: 'calc(100vh - 40px)'}}
      >
        <div className="flex justify-between items-center p-5 border-b border-dark-300/50">
          <h2 className="text-lg font-medium">
            {product ? (adjustingStock ? 'Update Stock' : 'Edit Product') : 'Add New Product'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-300/50 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto" style={{maxHeight: 'calc(100vh - 130px)'}}>
          <form onSubmit={handleSubmit}>
            {/* Stock adjustment mode toggle */}
            {product && (
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {adjustingStock ? 'Adjusting stock levels' : 'Editing product details'}
                </span>
                <button
                  type="button"
                  onClick={toggleStockMode}
                  className="px-4 py-1.5 bg-dark-300/70 text-white rounded-full text-sm hover:bg-dark-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {adjustingStock ? 'Edit Details' : 'Adjust Stock'}
                </button>
              </div>
            )}

            {adjustingStock && product ? (
              // Stock Adjustment Form
              <div className="space-y-5">
                <div className="p-5 bg-dark-300/30 rounded-xl border border-dark-300/30">
                  <h3 className="font-medium mb-3">{product.name}</h3>
                  <div className="flex justify-between text-sm mb-4 text-gray-300">
                    <span>Current Stock:</span>
                    <span className="font-medium text-white">{formData.stock} units</span>
                  </div>
                  
                  <div className="flex items-center justify-center mb-5 relative">
                    <button
                      type="button"
                      onClick={() => handleStockAdjustment(-1)}
                      className="bg-dark-300 h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-dark-200 transition-colors border-y border-l border-dark-200/30"
                    >
                      <MinusIcon className="h-5 w-5 text-white" />
                    </button>
                    <input
                      type="number"
                      name="stockAdjustment"
                      value={formData.stockAdjustment}
                      onChange={handleChange}
                      className="h-10 w-24 text-center bg-dark-300 text-white focus:outline-none border-y border-dark-200/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleStockAdjustment(1)}
                      className="bg-dark-300 h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-dark-200 transition-colors border-y border-r border-dark-200/30"
                    >
                      <PlusIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between text-sm bg-dark-400/50 p-3 rounded-lg">
                    <span className="text-gray-300">New Stock Level:</span>
                    <span className="font-medium text-white">
                      {parseInt(formData.stock) + parseInt(formData.stockAdjustment)} units
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 border border-dark-300/50 text-white rounded-xl hover:bg-dark-300/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            ) : (
              // Regular Product Form
              <>
                {/* Image upload section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-32 h-32 border border-dashed border-gray-400 rounded-xl flex items-center justify-center overflow-hidden bg-dark-300/30">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Product" className="h-full w-full object-cover" />
                      ) : (
                        <PhotographIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="bg-dark-300/70 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-dark-300 transition-colors text-center">
                        <span className="text-white text-sm">Choose Image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="px-4 py-2.5 text-sm text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className={`relative border ${
                    focusedField === 'name' 
                      ? 'border-primary' 
                      : 'border-dark-300/50'
                  } rounded-xl bg-dark-300/30 transition-all duration-200`}>
                    <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                      formData.name || focusedField === 'name'
                        ? 'text-xs top-1.5 text-primary'
                        : 'text-sm top-3.5 text-gray-400'
                    }`}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pt-6 pb-2 px-3 bg-transparent text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <div className={`relative border ${
                      focusedField === 'category' 
                        ? 'border-primary' 
                        : 'border-dark-300/50'
                    } rounded-xl bg-dark-300/30 transition-all duration-200`}>
                      <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                        formData.category || focusedField === 'category'
                          ? 'text-xs top-1.5 text-primary'
                          : 'text-sm top-3.5 text-gray-400'
                      }`}>
                        Category
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          id="category"
                          value={formData.category}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('category')}
                          onBlur={() => setFocusedField(null)}
                          className="appearance-none w-full pt-6 pb-2 px-3 bg-transparent text-white focus:outline-none cursor-pointer"
                        >
                          <option value="">Select category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Home Goods">Home Goods</option>
                          <option value="Office Supplies">Office Supplies</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className={`relative border ${
                      focusedField === 'sku' 
                        ? 'border-primary' 
                        : 'border-dark-300/50'
                    } rounded-xl bg-dark-300/30 transition-all duration-200`}>
                      <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                        formData.sku || focusedField === 'sku'
                          ? 'text-xs top-1.5 text-primary'
                          : 'text-sm top-3.5 text-gray-400'
                      }`}>
                        SKU/ID
                      </label>
                      <input
                        type="text"
                        name="sku"
                        id="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('sku')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pt-6 pb-2 px-3 bg-transparent text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div>
                    <div className={`relative border ${
                      focusedField === 'price' 
                        ? 'border-primary' 
                        : 'border-dark-300/50'
                    } rounded-xl bg-dark-300/30 transition-all duration-200`}>
                      <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                        formData.price || focusedField === 'price'
                          ? 'text-xs top-1.5 text-primary'
                          : 'text-sm top-3.5 text-gray-400'
                      }`}>
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('price')}
                        onBlur={() => setFocusedField(null)}
                        step="0.01"
                        min="0"
                        className="w-full pt-6 pb-2 px-3 bg-transparent text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className={`relative border ${
                      focusedField === 'stock' 
                        ? 'border-primary' 
                        : 'border-dark-300/50'
                    } rounded-xl bg-dark-300/30 transition-all duration-200`}>
                      <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                        formData.stock || focusedField === 'stock'
                          ? 'text-xs top-1.5 text-primary'
                          : 'text-sm top-3.5 text-gray-400'
                      }`}>
                        {product ? 'Current Stock' : 'Initial Stock'}
                      </label>
                      <input
                        type="number"
                        name="stock"
                        id="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('stock')}
                        onBlur={() => setFocusedField(null)}
                        min="0"
                        className="w-full pt-6 pb-2 px-3 bg-transparent text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="order-2 sm:order-1 py-3 border border-dark-300/50 text-white rounded-xl hover:bg-dark-300/30 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="order-1 sm:order-2 py-3 bg-primary text-white rounded-xl hover:bg-primary-600 transition-colors flex-1"
                  >
                    {product ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;