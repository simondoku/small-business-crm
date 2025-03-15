// src/components/auth/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-dark-600">
            <p className="text-white">Loading...</p>
        </div>;
    }

    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;