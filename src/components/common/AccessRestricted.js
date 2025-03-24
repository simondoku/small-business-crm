// src/components/common/AccessRestricted.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/authUtils';
import PermissionDenied from './PermissionDenied';

/**
 * Component that restricts access based on user role
 * @param {Object} props
 * @param {string|Array} props.requiredRole - Role(s) required to access content
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} props.fallback - Optional fallback content if unauthorized
 */
const AccessRestricted = ({ requiredRole, children, fallback }) => {
  const { user } = useAuth();
  const isAuthorized = hasPermission(user, requiredRole);
  
  if (!isAuthorized) {
    return fallback || <PermissionDenied />;
  }
  
  return <>{children}</>;
};

export default AccessRestricted;