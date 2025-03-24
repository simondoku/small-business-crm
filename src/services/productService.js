// src/services/productService.js
import api from './api';

// Get all products
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create new product
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Update product stock only
export const updateProductStock = async (id, stockData) => {
  const response = await api.put(`/products/${id}/stock`, stockData);
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};