// src/services/salesService.js
import api from './api';

// Get all sales
export const getSales = async () => {
  const response = await api.get('/sales');
  return response.data;
};

// Get sale by ID
export const getSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

// Create new sale
export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};