// src/components/common/LoadingScreen.js
import React from 'react';

/**
 * LoadingScreen component to display during lazy loading
 * Used as fallback for Suspense in production
 */
const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-500">
      <div className="bg-dark-400 rounded-xl p-8 shadow-apple-lg border border-dark-300/50 w-full max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Loading spinner */}
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-t-2 border-b-2 border-primary-light animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            <div className="absolute inset-6 rounded-full bg-primary-500/20"></div>
          </div>
          
          {/* Loading text */}
          <div className="text-center">
            <p className="text-white text-lg">{message}</p>
            <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;