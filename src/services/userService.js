// src/services/userService.js
import api from './api';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Create a new user (admin only)
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Check system setup status
export const checkSystemSetup = async () => {
  const response = await api.get('/users/check-setup');
  return response.data;
};

// Update user password
export const updatePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/users/update-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};