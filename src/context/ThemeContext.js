// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme options
export const THEMES = {
  DARK: 'dark',
  FOCUSED: 'focused'
};

// Create the context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or use dark as default
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // If saved theme was 'light', convert it to 'dark'
    if (savedTheme === 'light') return THEMES.DARK;
    // Return saved theme if it's valid, otherwise use dark as default
    return Object.values(THEMES).includes(savedTheme) ? savedTheme : THEMES.DARK;
  });

  // Update the theme class on the HTML element when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove(Object.values(THEMES));
    root.classList.remove('light'); // Also remove the old 'light' class if it exists
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to toggle between themes
  const toggleTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;