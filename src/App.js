// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import NewSale from './pages/NewSale';
import Customers from './pages/Customers';
import Login from './pages/Login';
import SetupPage from './pages/SetupPage';
import Register from './pages/Register';
import Reports from './pages/Reports';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import LandingPage from './pages/landing/LandingPage';
import { useAuth } from './context/AuthContext';

// Wrapper component to handle redirection based on auth state
const HomeRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<SetupPage />} />

          {/* Protected Routes - All Users */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/sales" element={
            <PrivateRoute>
              <NewSale />
            </PrivateRoute>
          } />

          <Route path="/products" element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          } />

          <Route path="/customers" element={
            <PrivateRoute>
              <Customers />
            </PrivateRoute>
          } />
          
          <Route path="/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />

          {/* Admin-only Routes */}
          <Route path="/register" element={
            <AdminRoute>
              <Register />
            </AdminRoute>
          } />
          
          <Route path="/users" element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;