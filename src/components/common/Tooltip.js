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
    <div className="relative inline-block tooltip-container" ref={tooltipRef}>
      <div 
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className={`absolute z-50 ${getPositionClasses()} w-64 p-4 bg-dark-300/95 backdrop-blur-md text-white text-sm rounded-xl shadow-apple-md border border-dark-200/30 animate-fadeIn`}
        >
          {content}
          
          {/* Arrow for tooltip direction indicator */}
          <div className={`absolute ${
            position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-2 border-b-0 border-l-8 border-r-8 border-t-8 border-t-dark-300/95 border-l-transparent border-r-transparent' :
            position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-t-0 border-l-8 border-r-8 border-b-8 border-b-dark-300/95 border-l-transparent border-r-transparent' : 
            position === 'right' ? 'left-0 top-1/2 -translate-x-2 -translate-y-1/2 border-r-0 border-t-8 border-b-8 border-l-8 border-l-dark-300/95 border-t-transparent border-b-transparent' :
            'right-0 top-1/2 translate-x-2 -translate-y-1/2 border-l-0 border-t-8 border-b-8 border-r-8 border-r-dark-300/95 border-t-transparent border-b-transparent'
          } w-0 h-0`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;