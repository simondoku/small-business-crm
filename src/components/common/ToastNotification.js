// src/components/common/ToastNotification.js
import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationIcon, XIcon } from '@heroicons/react/solid';

const ToastNotification = ({ 
  type = 'success', 
  message, 
  details = null,
  duration = 3000, 
  onClose 
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgClass: 'bg-green-500',
          bgOpacityClass: 'bg-green-500/10',
          borderClass: 'border-green-500/30',
          textClass: 'text-green-500',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />
        };
      case 'warning':
        return {
          bgClass: 'bg-yellow-500',
          bgOpacityClass: 'bg-yellow-500/10',
          borderClass: 'border-yellow-500/30',
          textClass: 'text-yellow-500',
          icon: <ExclamationIcon className="h-5 w-5 text-yellow-500" />
        };
      case 'error':
        return {
          bgClass: 'bg-red-500',
          bgOpacityClass: 'bg-red-500/10',
          borderClass: 'border-red-500/30',
          textClass: 'text-red-500',
          icon: <ExclamationIcon className="h-5 w-5 text-red-500" />
        };
      default:
        return {
          bgClass: 'bg-blue-500',
          bgOpacityClass: 'bg-blue-500/10',
          borderClass: 'border-blue-500/30',
          textClass: 'text-blue-500',
          icon: <CheckCircleIcon className="h-5 w-5 text-blue-500" />
        };
    }
  };

  const styles = getStyles();
  
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-slide-up">
      <div className={`${styles.bgOpacityClass} border ${styles.borderClass} rounded-xl p-4 shadow-lg flex items-start`}>
        <div className="flex-shrink-0 mr-3">
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${styles.textClass}`}>{message}</h3>
          {details && (
            <div className={`mt-1 text-sm ${styles.textClass} max-h-32 overflow-y-auto`}>
              {Array.isArray(details) ? (
                <ul className="list-disc pl-5 space-y-1">
                  {details.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{details}</p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={`ml-4 ${styles.textClass} hover:opacity-75`}
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;