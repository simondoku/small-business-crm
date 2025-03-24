// src/pages/SetupPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SetupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user, register, initialized } = useAuth();

    // If system is already initialized or user is logged in, redirect to dashboard
    useEffect(() => {
        if (initialized || user) {
            navigate('/');
        }
    }, [initialized, user, navigate]);

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
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                // No need to specify role as the backend will set it to admin for first user
            });

            if (result.success) {
                // Registration successful, redirect to login
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-600 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-extrabold text-white">Business CRM</h1>
                    <h2 className="mt-6 text-center text-xl font-bold text-white">Set Up Administrator Account</h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        This will be the primary admin account for your CRM system
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
                                placeholder="admin@example.com"
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
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-purple-700' : 'bg-primary hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                        >
                            {loading ? 'Creating Account...' : 'Create Admin Account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-primary hover:text-purple-400">
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetupPage;