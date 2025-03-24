// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children, title, onAddNew, onReset }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-600">
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
        {/* Sidebar - now collapsible on mobile */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content area - full width on mobile */}
        <div className="flex-1 p-3 md:p-6 md:ml-16">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;