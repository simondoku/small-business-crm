// src/components/common/LoadingScreen.js
import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-dark-600">
      <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
      <p className="text-white text-lg">{message}</p>
    </div>
  );
};

export default LoadingScreen;