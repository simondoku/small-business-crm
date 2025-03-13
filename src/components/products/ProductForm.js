// src/components/products/ProductForm.js
import React, { useState, useEffect } from 'react';
import { XIcon, PhotographIcon } from '@heroicons/react/solid';

const ProductForm = ({ product = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    price: '',
    stock: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert price and stock to numbers
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };
    
    onSave(formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-lg w-full max-w-md mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Initial Stock</label>
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
        </form>
      </div>
    </div>
  );
};

export default ProductForm;