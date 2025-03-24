// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

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
                
                // Check if the system has been initialized (has any users)
                const response = await api.get('/users/check-setup');
                setInitialized(response.data.hasUsers);
            } catch (error) {
                console.error('Error during authentication initialization:', error);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login user
    const login = async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            
            if (response.data) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                return { success: true, data: response.data };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    // Register new user - first user is admin
    const register = async (userData) => {
        try {
            // If system is not initialized, the first user will be an admin
            const role = !initialized ? 'admin' : userData.role || 'staff';
            
            const response = await api.post('/users', {
                ...userData,
                role
            });
            
            if (!initialized) {
                setInitialized(true);
            }
            
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    // Logout user
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
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
        login,
        register,
        logout,
        checkPermission
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};