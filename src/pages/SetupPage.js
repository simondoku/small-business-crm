// src/pages/SetupPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

const SetupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff' // Default to staff
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFirstUser, setIsFirstUser] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, register, initialized, hasAdmin, loading: authLoading } = useAuth();

    // Check if this is the first user (for admin role)
    useEffect(() => {
        if (!authLoading) {
            setIsFirstUser(!initialized && !hasAdmin);
        }
    }, [initialized, hasAdmin, authLoading]);

    // If user is logged in, redirect to dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            
            // If this is the first user, register as admin, otherwise use selected role
            const userRole = isFirstUser ? 'admin' : formData.role;
            
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: userRole
            });

            if (result.success) {
                // Registration successful - redirect to login
                navigate('/login');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <LoadingScreen message="Checking system status..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-600 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-extrabold text-white">Business CRM</h1>
                    <h2 className="mt-6 text-center text-xl font-bold text-white">
                        {isFirstUser 
                            ? "Set Up Administrator Account" 
                            : "Create New Account"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        {isFirstUser
                            ? "This will be the primary admin account for your CRM system"
                            : "Create your account to access the CRM system"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-dark-300 placeholder-gray-500 text-white bg-dark-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-dark-300 placeholder-gray-500 text-white bg-dark-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-dark-300 placeholder-gray-500 text-white bg-dark-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-dark-300 placeholder-gray-500 text-white bg-dark-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Only show role selector if not first user */}
                        {!isFirstUser && (
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-300">Account Type</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-dark-300 placeholder-gray-500 text-white bg-dark-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                >
                                    <option value="staff">Staff Account</option>
                                    <option value="admin">Admin Account</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-400">
                                    Note: Admin requests may require approval
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-purple-700' : 'bg-primary hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-primary hover:text-purple-400">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetupPage;