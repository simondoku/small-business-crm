// src/components/products/ProductForm.js
import React, { useState, useEffect } from 'react';
import { XIcon, PhotographIcon, PlusIcon, MinusIcon } from '@heroicons/react/solid';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold">
            {product ? (adjustingStock ? 'Update Stock' : 'Edit Product') : 'Add New Product'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Stock adjustment mode */}
          {product && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {adjustingStock ? 'Adjusting stock levels' : 'Editing product details'}
              </span>
              <button
                type="button"
                onClick={toggleStockMode}
                className="px-3 py-1 bg-primary text-white rounded-md text-sm"
              >
                {adjustingStock ? 'Edit Details' : 'Adjust Stock'}
              </button>
            </div>
          )}

          {adjustingStock && product ? (
            // Stock Adjustment Form
            <div className="space-y-4">
              <div className="p-4 bg-dark-300 rounded-lg">
                <h3 className="font-medium mb-2">{product.name}</h3>
                <div className="flex justify-between text-sm mb-4">
                  <span>Current Stock:</span>
                  <span className="font-medium">{formData.stock} units</span>
                </div>
                
                <div className="flex items-center justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(-1)}
                    className="bg-dark-200 h-10 w-10 rounded-l-lg flex items-center justify-center hover:bg-dark-100"
                  >
                    <MinusIcon className="h-5 w-5 text-white" />
                  </button>
                  <input
                    type="number"
                    name="stockAdjustment"
                    value={formData.stockAdjustment}
                    onChange={handleChange}
                    className="h-10 w-20 text-center bg-dark-200 text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(1)}
                    className="bg-dark-200 h-10 w-10 rounded-r-lg flex items-center justify-center hover:bg-dark-100"
                  >
                    <PlusIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>New Stock Level:</span>
                  <span className="font-medium">
                    {parseInt(formData.stock) + parseInt(formData.stockAdjustment)} units
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
              >
                Update Stock
              </button>
            </div>
          ) : (
            // Regular Product Form
            <>
              {/* Image upload section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Image</label>
                <div className="flex items-center">
                  <div className="w-24 h-24 border border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden mr-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Product" className="h-full w-full object-cover" />
                    ) : (
                      <PhotographIcon className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="bg-dark-200 px-4 py-2 rounded-md cursor-pointer hover:bg-dark-100 block">
                      <span className="text-white">Choose Image</span>
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
                        className="mt-2 text-sm text-red-400 hover:text-red-300"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home Goods">Home Goods</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">SKU/ID</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {product ? 'Current Stock' : 'Initial Stock'}
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2 bg-dark-200 text-white rounded-md hover:bg-dark-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                >
                  {product ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductForm;