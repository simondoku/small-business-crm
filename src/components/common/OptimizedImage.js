// src/components/common/OptimizedImage.js
import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage component that adds:
 * - Lazy loading
 * - Blur placeholder loading effect
 * - Error handling with fallback
 * - Progressive loading
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  width,
  height,
  style = {},
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Reset loading state when the source changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleImageLoaded = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    setError(true);
    if (onError) onError(e);
  };

  // Calculate placeholder size - for production it's better to use real
  // placeholder images rather than colored divs
  const placeholderStyle = {
    width: width || '100%',
    height: height || '100%',
    backgroundColor: '#333',
    ...style,
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: width, height: height }}
    >
      {/* Placeholder */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0 animate-pulse bg-dark-300"
          style={placeholderStyle}
        />
      )}
      
      {/* Actual image */}
      <img
        src={error && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        className={`w-full h-full transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoaded}
        onError={handleImageError}
        style={style}
        {...props}
      />
      
      {/* Error state */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-300 text-gray-400 text-sm">
          {alt ? alt.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;