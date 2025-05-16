import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FocusContext = createContext();

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }) => {
  const [focusMode, setFocusMode] = useState(false);
  const [previousPath, setPreviousPath] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track the current path when not in focus mode
  useEffect(() => {
    if (!focusMode && location.pathname !== '/sales') {
      setPreviousPath(location.pathname);
    }
  }, [focusMode, location.pathname]);
  
  // Toggle focus mode on/off
  const toggleFocusMode = () => {
    setFocusMode(prevMode => {
      const newMode = !prevMode;
      
      // If entering focus mode, navigate to sales page
      if (newMode) {
        if (location.pathname !== '/sales') {
          navigate('/sales');
        }
      } else {
        // When exiting focus mode, return to the previous page if not already on sales
        if (previousPath && previousPath !== '/sales') {
          navigate(previousPath);
        }
      }
      
      return newMode;
    });
  };
  
  // Enter focus mode
  const enterFocusMode = () => {
    if (!focusMode) {
      // Save current location before going to sales page
      if (location.pathname !== '/sales') {
        setPreviousPath(location.pathname);
        navigate('/sales');
      }
      setFocusMode(true);
    }
  };
  
  // Exit focus mode
  const exitFocusMode = () => {
    if (focusMode) {
      // Return to previous page when exiting focus mode
      if (previousPath && previousPath !== '/sales') {
        navigate(previousPath);
      }
      setFocusMode(false);
    }
  };
  
  const value = {
    focusMode,
    toggleFocusMode,
    enterFocusMode,
    exitFocusMode,
    previousPath
  };
  
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};

export default FocusContext;