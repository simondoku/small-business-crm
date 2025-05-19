// src/components/categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import { XIcon } from '@heroicons/react/outline';
import { createCategory, updateCategory } from '../../services/categoryService';

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      let savedCategory;
      if (category) {
        // Update existing category
        savedCategory = await updateCategory(category._id, formData);
      } else {
        // Create new category
        savedCategory = await createCategory(formData);
      }
      onSave(savedCategory);
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save category' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-xl p-6 shadow-xl w-full max-w-md relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XIcon className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold text-white mb-6">
          {category ? 'Edit Category' : 'Add New Category'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Category Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-dark-300 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border border-red-500' : 'border border-dark-200'
              }`}
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-300 text-white rounded-lg border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Enter category description (optional)"
            ></textarea>
          </div>
          
          {errors.submit && (
            <p className="mb-4 text-sm text-red-500">{errors.submit}</p>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-dark-300 text-white rounded-lg hover:bg-dark-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;