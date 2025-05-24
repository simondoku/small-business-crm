// src/config/environment.js
/**
 * Central location for environment variables and configuration
 * This helps ensure consistency across the application
 */

// Force local development by default in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// API Configuration
export const API_CONFIG = {
  // Always use localhost in development, use production API URL in production
  baseUrl: isDevelopment 
    ? 'http://localhost:5003/api' 
    : (process.env.REACT_APP_API_URL || 'https://businesscrm-api.vercel.app/api'),
  timeout: 30000,
  retryAttempts: 2
};

// Log the configuration in development
if (isDevelopment) {
  console.log('Environment Configuration:', {
    mode: process.env.NODE_ENV,
    apiBaseUrl: API_CONFIG.baseUrl
  });
}

// Feature flags
export const FEATURES = {
  analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  notifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false'
};

// Other environment settings
export const ENV_SETTINGS = {
  stripeKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info'
};

export default {
  API_CONFIG,
  FEATURES,
  ENV_SETTINGS
};
