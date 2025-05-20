// src/services/userService.js
import api from './api';

// Get all users (admin only)
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Login user
export const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
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

// Record user logout
export const logoutUser = async () => {
  const response = await api.post('/users/logout');
  return response.data;
};

// Get user activity history (admin only)
export const getUserActivity = async (userId) => {
  const response = await api.get(`/users/${userId}/activity`);
  return response.data;
};

// Update a user (admin only)
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// Delete a user (admin only)
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};