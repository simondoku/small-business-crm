// src/config/environment.js
/**
 * Central location for environment variables and configuration
 * This helps ensure consistency across the application
 * Updated: June 2025 - Fixed git configuration for proper GitHub contributions tracking
 */

// Force local development by default in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// API Configuration
export const API_CONFIG = {
  // Use backend server running on port 5003
  baseUrl: isDevelopment
    ? "http://localhost:5003/api" // Local development backend
    : "https://businesscrmfrontend-simons-projects-94c78eac.vercel.app/api", // Use the same domain as frontend
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
