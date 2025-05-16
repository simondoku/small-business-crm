// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { useFocus } from '../../context/FocusContext';

const MainLayout = ({ children, title, onAddNew, onReset }) => {
  const { user, logout } = useAuth();
  const { focusMode, toggleFocusMode } = useFocus();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarExpanded = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-dark-600 to-dark-500">
      {/* Mobile-friendly header with menu toggle */}
      <Header
        title={title}
        onAddNew={onAddNew}
        user={user}
        onLogout={logout}
        onReset={onReset}
        onToggleSidebar={toggleSidebar}
        focusMode={focusMode}
        toggleFocusMode={toggleFocusMode}
      />
      
      <div className="flex flex-1 relative">
        {/* Sidebar - hidden in focus mode */}
        {!focusMode && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            isExpanded={sidebarExpanded}
            onToggleExpand={toggleSidebarExpanded}
          />
        )}
        
        {/* Main content area - adjusts based on sidebar state and focus mode */}
        <div 
          className={`flex-1 p-4 md:p-6 transition-all duration-300 ${
            focusMode 
              ? 'ml-0' 
              : sidebarExpanded ? 'md:ml-64' : 'md:ml-16'
          } overflow-hidden`}
        >
          <main className={`${focusMode ? 'focus-mode-content' : ''} fade-in`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;