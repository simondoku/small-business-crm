// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockClosedIcon } from '@heroicons/react/solid';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { user, login, initialized } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const result = await login(email, password);
            
            if (result.success) {
                navigate('/dashboard');
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-dark-600 to-dark-500 px-4 sm:px-6 lg:px-8">
            <Link to="/" className="mb-8 flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="ml-2 text-xl font-medium text-white">BusinessCRM</span>
            </Link>

            <div className="w-full max-w-md">
                <div className="card p-8 shadow-apple-lg backdrop-blur-sm border border-dark-300 slide-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
                            <LockClosedIcon className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Sign in</h2>
                        <p className="text-gray-400 mt-1">Access your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="you@example.com"
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
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2.5 px-4 rounded-lg text-white font-medium 
                                    ${loading 
                                        ? 'bg-primary-700 cursor-not-allowed' 
                                        : 'btn-primary'
                                    }`}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {!initialized && (
                        <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg text-center">
                            <p className="text-white font-medium mb-1">Welcome to BusinessCRM!</p>
                            <p className="text-sm text-gray-300 mb-3">
                                This appears to be your first time using the app.
                                Set up an administrator account to get started.
                            </p>
                            <Link 
                                to="/setup" 
                                className="inline-block btn btn-primary text-sm"
                            >
                                Set Up Your Account
                            </Link>
                        </div>
                    )}

                    {initialized && (
                        <p className="mt-4 text-center text-sm text-gray-400">
                            Don't have an account? <Link to="/" className="text-primary-400 hover:text-primary-300">Return to home</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;