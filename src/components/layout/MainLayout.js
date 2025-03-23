// src/components/layout/MainLayout.js
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children, title, onAddNew, onReset }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-dark-600">
      <Sidebar />
      <div className="flex-1 ml-16 p-6">
        <Header
          title={title}
          onAddNew={onAddNew}
          user={user}
          onLogout={logout}
          onReset={onReset}
        />
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;