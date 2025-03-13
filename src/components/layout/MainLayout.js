// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import QuickActionMenu from '../dashboard/QuickActionMenu';

const MainLayout = ({ children, title, onAddNew }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleAddButton = () => {
    if (isDashboard) {
      setShowQuickActions(true);
    } else if (onAddNew) {
      onAddNew();
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-600">
      <Sidebar />
      <div className="flex-1 ml-16 p-6">
        <Header title={title} onAddButton={handleAddButton} />
        <main className="mt-6">{children}</main>
        
        {showQuickActions && (
          <QuickActionMenu onClose={() => setShowQuickActions(false)} />
        )}
      </div>
    </div>
  );
};

export default MainLayout;