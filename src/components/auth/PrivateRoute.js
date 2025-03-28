// src/components/auth/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading, initialized } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-dark-600">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    // If system is not initialized, redirect to setup page
    if (!initialized) {
        return <Navigate to="/setup" />;
    }

    // If user is not logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;