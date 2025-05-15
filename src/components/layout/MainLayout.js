// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children, title, onAddNew, onReset }) => {
  const { user, logout } = useAuth();
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
      />
      
      <div className="flex flex-1 relative">
        {/* Sidebar - now collapsible on mobile and expandable on desktop */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isExpanded={sidebarExpanded}
          onToggleExpand={toggleSidebarExpanded}
        />
        
        {/* Main content area - adjusts based on sidebar state */}
        <div className={`flex-1 p-4 md:p-6 transition-all duration-300 ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'} overflow-hidden`}>
          <main className="fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;