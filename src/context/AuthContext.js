// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { logoutUser } from '../services/userService';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [hasAdmin, setHasAdmin] = useState(false);
    const [authError, setAuthError] = useState(null);

    // Check if user is already logged in
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                }
                
                // Check if the system has been initialized (has any admin users)
                try {
                    const response = await api.get('/users/check-setup');
                    setInitialized(response.data.initialized);
                    setHasAdmin(response.data.hasAdmin);
                } catch (setupError) {
                    console.error('Error checking system setup:', setupError);
                    // Don't clear user data if only the setup check fails
                    // Instead, assume system is initialized to avoid blocking the UI
                    setInitialized(true);
                    setAuthError('System setup check failed, but proceeding with authentication');
                }
            } catch (error) {
                console.error('Error during authentication initialization:', error);
                localStorage.removeItem('user');
                setAuthError('Authentication failed. Please log in again.');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login user
    const login = async (email, password) => {
        try {
            console.log('Attempting login with API URL:', api.defaults.baseURL);
            
            // Use the API instance which has the correct baseURL configuration
            const response = await api.post('/users/login', { email, password });
            
            if (response.data) {
                console.log('Login successful, user data received');
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                return { success: true, data: response.data };
            }
        } catch (error) {
            console.error('Login error:', error.message);
            console.error('Error response:', error.response?.data);
            console.error('Request URL that failed:', error.config?.url);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    // Register new user
    const register = async (userData) => {
        try {
            console.log('Attempting registration with API URL:', api.defaults.baseURL);
            
            // Use direct axios call with full URL to bypass any URL transformation issues
            const registerUrl = 'https://businesscrm-suix99spo-simons-projects-94c78eac.vercel.app/api/users';
            console.log('Using direct registration URL:', registerUrl);
            
            const response = await axios.post(registerUrl, userData, {
                timeout: 60000, // 60 seconds for registration specifically
            });
            
            if (response.data && response.data.success) {
                // Update initialization status if a new admin was successfully registered
                if (response.data.role === 'admin') {
                    setInitialized(true);
                    setHasAdmin(true);
                }
                // Registration is successful, return data. User will be redirected to login.
                return { success: true, data: response.data };
            } else {
                // Handle cases where backend returns success:false or unexpected structure
                return { 
                    success: false, 
                    message: response.data?.message || 'Registration failed due to an unexpected server response.' 
                };
            }
        } catch (error) {
            console.error('Registration error:', error.message);
            console.error('Error response:', error.response?.data);
            console.error('Request URL that failed:', error.config?.url);
            
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    message: 'Registration timed out. The server might be busy or experiencing issues. Please try again.',
                    isTimeout: true
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    // Logout user
    const logout = async () => {
        try {
            if (user) {
                // Record logout in backend
                await logoutUser();
            }
        } catch (error) {
            console.error('Error recording logout:', error);
        } finally {
            // Always clear local state even if API call fails
            setUser(null);
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    const checkPermission = (requiredRole) => {
        if (!user) return false;
        if (requiredRole === 'admin') return user.role === 'admin';
        return true; // Staff can access non-admin routes
    };

    const value = {
        user,
        loading,
        initialized,
        hasAdmin,
        login,
        register,
        logout,
        checkPermission,
        authError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
