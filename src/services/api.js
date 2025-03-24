// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If token is expired and we're not already retrying
      originalRequest._retry = true;
      
      // Check for specific error messages
      if (error.response.data.message === 'Token expired') {
        // Force logout
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }
    }
    
    // Handle unauthorized access
    if (error.response && error.response.status === 403) {
      // Forbidden - user doesn't have required permissions
      console.warn('Access forbidden:', error.response.data.message);
      // You could redirect to a "forbidden" page or show a message
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;