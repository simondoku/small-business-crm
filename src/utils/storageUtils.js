// src/utils/storageUtils.js
import LZString from 'lz-string';

/**
 * Enhanced storage utilities with compression for large data
 * Improves performance when storing large datasets in localStorage
 */

// Size threshold for compression in bytes (10KB)
const COMPRESSION_THRESHOLD = 10 * 1024;

/**
 * Check if storage is available
 */
const isStorageAvailable = (type) => {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get storage quota info
 */
const getStorageQuotaInfo = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      percentUsed: Math.round((estimate.usage / estimate.quota) * 100),
      remaining: estimate.quota - estimate.usage
    };
  }
  return null;
};

/**
 * Set item with optional compression for large data
 */
const setItem = (key, value) => {
  try {
    // Convert to string if not already
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Check if compression is needed (for large data)
    if (stringValue.length > COMPRESSION_THRESHOLD) {
      const compressed = LZString.compressToUTF16(stringValue);
      localStorage.setItem(`${key}_compressed`, 'true');
      localStorage.setItem(key, compressed);
    } else {
      localStorage.removeItem(`${key}_compressed`);
      localStorage.setItem(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error('Error storing data in localStorage:', error);
    // Try to recover space if quota exceeded
    if (error.name === 'QuotaExceededError') {
      clearOldItems();
    }
    return false;
  }
};

/**
 * Get item with automatic decompression if needed
 */
const getItem = (key, parse = true) => {
  try {
    // Check if this item was compressed
    const isCompressed = localStorage.getItem(`${key}_compressed`) === 'true';
    const value = localStorage.getItem(key);
    
    if (!value) return null;
    
    // Decompress if needed
    const finalValue = isCompressed ? LZString.decompressFromUTF16(value) : value;
    
    // Parse as JSON if requested and possible
    if (parse) {
      try {
        return JSON.parse(finalValue);
      } catch (e) {
        return finalValue;
      }
    }
    
    return finalValue;
  } catch (error) {
    console.error('Error retrieving data from localStorage:', error);
    return null;
  }
};

/**
 * Remove item and associated compression flag
 */
const removeItem = (key) => {
  try {
    localStorage.removeItem(`${key}_compressed`);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data from localStorage:', error);
    return false;
  }
};

/**
 * Clear all items in storage
 */
const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Clear older or less important items to make space
 * This is a basic implementation - customize based on your app's needs
 */
const clearOldItems = () => {
  try {
    // Get all keys that contain "cache" or "temp" and remove them
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('cache') || key.includes('temp')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return keysToRemove.length > 0;
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
    return false;
  }
};

/**
 * Get all keys with a specific prefix
 */
const getKeysWithPrefix = (prefix) => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix) && !key.endsWith('_compressed')) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Error getting keys from localStorage:', error);
    return [];
  }
};

/**
 * Cache data with expiration
 */
const cacheWithExpiry = (key, value, ttlMs) => {
  const now = new Date();
  
  // Create object with the value and expiry time
  const item = {
    value,
    expiry: now.getTime() + ttlMs,
  };
  
  return setItem(key, item);
};

/**
 * Get cached data if not expired
 */
const getCachedItem = (key) => {
  const itemStr = getItem(key, false);
  
  // Return null if no item
  if (!itemStr) {
    return null;
  }
  
  let item;
  try {
    item = JSON.parse(itemStr);
  } catch (e) {
    // Not a valid JSON, just return the string
    return itemStr;
  }
  
  // Check for expiry structure
  if (!item.expiry) {
    return item;
  }
  
  const now = new Date();
  
  // If the item is expired, remove it and return null
  if (now.getTime() > item.expiry) {
    removeItem(key);
    return null;
  }
  
  return item.value;
};

export const storageUtils = {
  isAvailable: isStorageAvailable('localStorage'),
  setItem,
  getItem,
  removeItem,
  clear,
  clearOldItems,
  getKeysWithPrefix,
  cacheWithExpiry,
  getCachedItem,
  getStorageQuotaInfo
};

export default storageUtils;