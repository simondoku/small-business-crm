// src/services/api.js
import axios from 'axios';

// Determine the base URL dynamically based on the current domain
const getBaseUrl = () => {
  // In the browser
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api`;
  }
  // Fallback to environment variable or default
  return process.env.REACT_APP_API_URL || 'https://www.bcrm.dev/api';
};

const API_URL = getBaseUrl();

// Log the API URL in development to help with debugging
console.log('API URL:', API_URL); // Always log this for debugging

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_DURATION = process.env.REACT_APP_CACHE_DURATION ? 
  parseInt(process.env.REACT_APP_CACHE_DURATION) : 5 * 60 * 1000; // 5 minutes by default

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for production to match backend timeouts
  timeout: 25000, // 25 seconds - increased from 10 seconds
});

// Enhanced request debugging
if (process.env.NODE_ENV !== 'production') {
  api.interceptors.request.use(request => {
    console.log('Request:', {
      url: request.url,
      baseURL: request.baseURL,
      method: request.method,
      headers: request.headers,
      data: request.data
    });
    return request;
  });

  api.interceptors.response.use(
    response => {
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    error => {
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      return Promise.reject(error);
    }
  );
}

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
    
    // Log detailed error information for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: originalRequest.url,
        baseURL: originalRequest.baseURL,
        method: originalRequest.method
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', {
        request: error.request,
        url: originalRequest.url,
        baseURL: originalRequest.baseURL,
        method: originalRequest.method,
        timeout: originalRequest.timeout
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Setup:', error.message);
    }
    
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
}

// Export a function to test API connectivity
export const testApiConnection = async () => {
  try {
    const response = await api.get('/debug');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

export default api;