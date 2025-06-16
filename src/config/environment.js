// src/config/environment.js
/**
 * Central location for environment variables and configuration
 * This helps ensure consistency across the application
 * Updated: June 2025 - Fixed git configuration for proper GitHub contributions tracking
 */

// Force local development by default in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Get the backend API URL with environment variable support
const getBackendUrl = () => {
  if (isDevelopment) {
    return process.env.REACT_APP_API_URL || "http://localhost:5003/api";
  }

  // Production: Use environment variable first, then fallback to current backend URL
  return (
    process.env.REACT_APP_API_URL ||
    "https://businesscrm-oqyz6nbdi-simons-projects-94c78eac.vercel.app/api"
  );
};

// API Configuration
export const API_CONFIG = {
  // Use backend server running on port 5003
  baseUrl: getBackendUrl(),
  timeout: 30000,
  retryAttempts: 2,
};

// Log the configuration in development and production for debugging
if (isDevelopment) {
  console.log("Environment Configuration:", {
    mode: process.env.NODE_ENV,
    apiBaseUrl: API_CONFIG.baseUrl,
    publicUrl: process.env.PUBLIC_URL,
    envApiUrl: process.env.REACT_APP_API_URL,
  });
} else {
  console.log("Production API Configuration:", {
    apiBaseUrl: API_CONFIG.baseUrl,
    hasEnvOverride: !!process.env.REACT_APP_API_URL,
  });
}

// Feature flags
export const FEATURES = {
  analytics: process.env.REACT_APP_ENABLE_ANALYTICS === "true",
  notifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== "false",
};

// Other environment settings
export const ENV_SETTINGS = {
  stripeKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  logLevel: process.env.REACT_APP_LOG_LEVEL || "info",
};

const config = {
  API_CONFIG,
  FEATURES,
  ENV_SETTINGS,
};

export default config;
