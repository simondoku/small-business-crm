// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);

                    // Set auth token for future requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
                } catch (error) {
                    console.error('Error parsing stored user data:', error);
                    localStorage.removeItem('user');
                }
            }

            setLoading(false);
        };

        loadUser();
    }, []);

    // Login user
    const login = async (email, password) => {
        const response = await api.post('/users/login', { email, password });

        if (response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }

        return response.data;
    };

    // Register new user
    const register = async (name, email, password, role = 'staff') => {
        const response = await api.post('/users', { name, email, password, role });

        return response.data;
    };

    // Logout user
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};