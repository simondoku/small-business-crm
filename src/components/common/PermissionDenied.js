// src/components/common/PermissionDenied.js
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/solid';

const PermissionDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-600 p-4">
      <div className="bg-dark-400 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-xl font-bold mb-4">Permission Denied</h1>
        
        <p className="text-gray-300 mb-6">
          You don't have the necessary permissions to access this section.
          This area is restricted to administrator accounts.
        </p>
        
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PermissionDenied;