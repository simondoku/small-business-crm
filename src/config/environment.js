// src/config/environment.js
/**
 * Central location for environment variables and configuration
 * This helps ensure consistency across the application
 */

// Force local development by default in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// API Configuration
export const API_CONFIG = {
  // Use backend server running on port 5003
  baseUrl: isDevelopment
    ? "http://localhost:5003/api" // Updated to use backend server port
    : process.env.REACT_APP_API_URL || "https://bcrm.dev/api", // Use stable custom domain instead of changing deployment URLs
  timeout: 30000,
  retryAttempts: 2,
};

// Log the configuration in development
if (isDevelopment) {
  console.log("Environment Configuration:", {
    mode: process.env.NODE_ENV,
    apiBaseUrl: API_CONFIG.baseUrl,
    publicUrl: process.env.PUBLIC_URL,
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
