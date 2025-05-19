// src/components/categories/CategoryList.js
import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/outline';
import { getCategories, deleteCategory } from '../../services/categoryService';
import CategoryForm from './CategoryForm';
import { ToastNotification } from '../common/ToastNotification';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(cat => cat._id !== id));
        showToast('Category deleted successfully', 'success');
      } catch (error) {
        console.error("Error deleting category:", error);
        showToast('Failed to delete category', 'error');
      }
    }
  };

  const handleCategoryUpdated = (updatedCategory) => {
    if (selectedCategory) {
      // Update existing category in the list
      setCategories(categories.map(cat => 
        cat._id === updatedCategory._id ? updatedCategory : cat
      ));
      showToast('Category updated successfully', 'success');
    } else {
      // Add new category to the list
      setCategories([...categories, updatedCategory]);
      showToast('Category created successfully', 'success');
    }
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <div className="bg-dark-400 rounded-xl p-6 shadow-xl h-full">
      {toast.show && <ToastNotification message={toast.message} type={toast.type} />}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Product Categories</h2>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsFormOpen(true);
          }}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-3 text-gray-300">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-dark-300 rounded-lg">
          <p className="text-gray-400 mb-4">No categories found</p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setIsFormOpen(true);
            }}
            className="bg-dark-300 hover:bg-dark-200 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="overflow-hidden bg-dark-300/30 rounded-xl border border-dark-300/50">
          <table className="min-w-full divide-y divide-dark-300/50">
            <thead className="bg-dark-300/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-300/50">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-dark-300/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {category.productCount || 0} products
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-primary hover:text-primary-400 mr-4 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <CategoryForm
          category={selectedCategory}
          onSave={handleCategoryUpdated}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default CategoryList;