// src/components/common/Tooltip.js
import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, content, position = 'left' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  
  // Calculate position classes based on the 'position' prop
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'right':
        return 'left-full top-0 ml-2';
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'left':
      default:
        return 'right-full top-0 mr-2';
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <div 
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className={`absolute z-50 ${getPositionClasses()} w-64 p-3 bg-dark-200 text-white text-sm rounded-lg shadow-lg`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;