// src/components/auth/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-dark-600">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    // Check if user is logged in and is an admin
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user is not an admin, redirect to dashboard
    if (user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;