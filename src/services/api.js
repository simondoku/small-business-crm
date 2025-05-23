// src/services/api.js
import axios from 'axios';
import { API_CONFIG } from '../config/environment';

// Use the centralized environment configuration for API settings
console.log('API URL being used:', API_CONFIG.baseUrl); // Debug log to verify URL

// Use the environment configuration consistently across development and production
const baseURL = process.env.REACT_APP_API_URL || API_CONFIG.baseUrl;

console.log('Final baseURL for axios:', baseURL); // Additional debug log

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = process.env.REACT_APP_CACHE_DURATION ? 
  parseInt(process.env.REACT_APP_CACHE_DURATION) : 5 * 60 * 1000; // 5 minutes by default

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for slow connections or heavy operations
  timeout: API_CONFIG.timeout,
});

// Test API connection function - added to fix build error
export const testApiConnection = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      data: null,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = getCacheKey(response.config);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    
    // Clear related cache entries when data is modified
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method)) {
      // Extract the base resource path to clear related cache
      const url = response.config.url;
      if (url) {
        const resourcePath = url.split('/').slice(0, -1).join('/');
        clearApiCacheFor(resourcePath);
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Implement retry logic for network errors or 5xx server errors
    if ((error.code === 'ECONNABORTED' || 
        (error.response && error.response.status >= 500)) && 
        !originalRequest._retry && 
        originalRequest.method !== 'post') {
      
      originalRequest._retry = true;
      originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
      
      if (originalRequest.retryCount <= 2) { // Maximum 2 retries
        const backoffDelay = originalRequest.retryCount * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return api(originalRequest);
      }
    }
    
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
    
    // Check cache for GET requests unless caching is disabled
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = getCacheKey(config);
      const cachedResponse = cache.get(cacheKey);
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        // Return cached data as a resolved promise
        return {
          ...config,
          adapter: () => {
            return Promise.resolve({
              data: cachedResponse.data,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
              cached: true
            });
          }
        };
      }
    }

    // Add a timestamp to prevent caching by the browser in production
    if (process.env.NODE_ENV === 'production' && config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to generate cache keys
function getCacheKey(config) {
  return `${config.url}|${JSON.stringify(config.params || {})}`;
}

// Function to clear cache
export const clearApiCache = () => {
  cache.clear();
};

// Function to clear specific cache entry
export const clearApiCacheFor = (url) => {
  for (let key of cache.keys()) {
    if (key.startsWith(url)) {
      cache.delete(key);
    }
  }
};

// Add special configuration for Vercel deployment
// Detect if we're in a Vercel production environment
const isVercelProduction = process.env.VERCEL === '1' && process.env.NODE_ENV === 'production';

if (isVercelProduction) {
  // Add a timestamp to all GET requests to avoid CDN caching issues in Vercel
  api.interceptors.request.use(config => {
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _v: Date.now() // Vercel-specific cache buster
      };
    }
    return config;
  });
  
  // Set more aggressive caching for Vercel's serverless functions
  api.defaults.headers.common['Cache-Control'] = 'public, max-age=30, stale-while-revalidate=300';
}

export default api;
