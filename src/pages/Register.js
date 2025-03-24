// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff' // Default role
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { register, user } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

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
                role: formData.role
            });

            if (result.success) {
                setSuccess(`User ${formData.name} created successfully!`);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'staff'
                });
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
        <MainLayout title="Register New User">
            <div className="max-w-md mx-auto bg-dark-400 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Add New Staff Member</h2>

                {error && (
                    <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="staff@example.com"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                            User Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Staff members can manage customers, products, and sales.
                            Admins have full access to all features including user management.
                        </p>
                    </div>
                    
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                                loading ? 'bg-purple-700' : 'bg-primary hover:bg-purple-700'
                            }`}
                        >
                            {loading ? 'Creating User...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default Register;