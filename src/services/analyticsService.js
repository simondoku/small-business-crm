// src/services/analyticsService.js
import api from './api';

// Get sales by category
export const getSalesByCategory = async (startDate, endDate) => {
  const response = await api.get('/analytics/sales-by-category', { 
    params: { startDate, endDate } 
  });
  return response.data;
};

// Get monthly sales data
export const getMonthlySales = async (year) => {
  const response = await api.get('/analytics/monthly-sales', {
    params: { year }
  });
  return response.data;
};

// Get daily sales data
export const getDailySales = async (startDate, endDate) => {
  const response = await api.get('/analytics/daily-sales', {
    params: { startDate, endDate }
  });
  return response.data;
};