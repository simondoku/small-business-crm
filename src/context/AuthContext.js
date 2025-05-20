// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { logoutUser, login as loginService, register as registerService, checkSystemSetup } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [hasAdmin, setHasAdmin] = useState(false);

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
                const setupData = await checkSystemSetup();
                setInitialized(setupData.initialized);
                setHasAdmin(setupData.hasAdmin);
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
            const data = await loginService(email, password);
            
            if (data) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                return { success: true, data };
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
            // Use the registerService from userService.js
            const data = await registerService(userData);
            
            if (data.success) {
                // Update initialization status when successful admin registration occurs
                if (data.role === 'admin') {
                    setInitialized(true);
                    setHasAdmin(true);
                }
            }
            
            return { success: true, data };
        } catch (error) {
            // Check if this error is because system is already initialized
            if (error.response?.data?.initialized) {
                setInitialized(true);
                setHasAdmin(true);
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.',
                initialized: error.response?.data?.initialized
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
        checkPermission
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};