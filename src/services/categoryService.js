// src/services/categoryService.js
import api from './api';

/**
 * Fetch all categories
 * @returns {Promise<Array>} - Promise resolving to array of categories
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>} - Promise resolving to category object
 */
export const getCategory = async (id) => {
  try {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data object with name property
 * @returns {Promise<Object>} - Promise resolving to created category
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update an existing category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} - Promise resolving to updated category
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a category
 * @param {string} id - Category ID to delete
 * @returns {Promise<Object>} - Promise with response data
 */
export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};