// src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FocusProvider } from './context/FocusContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const NewSale = lazy(() => import('./pages/NewSale'));
const Customers = lazy(() => import('./pages/Customers'));
const Login = lazy(() => import('./pages/Login'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const Register = lazy(() => import('./pages/Register'));
const Reports = lazy(() => import('./pages/Reports'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));

// Wrapper component to handle redirection based on auth state
const HomeRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : <LandingPage />;
};

// Create a component for the app routes to properly use the FocusProvider with Router hooks
const AppRoutes = () => {
  return (
    <FocusProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
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
        </Suspense>
      </ErrorBoundary>
    </FocusProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
