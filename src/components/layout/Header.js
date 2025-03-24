// src/components/layout/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  UserIcon, 
  LogoutIcon, 
  RefreshIcon, 
  MenuIcon, 
  UserAddIcon,
  ChartBarIcon
} from '@heroicons/react/solid';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title, onAddNew, onReset, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-dark-400 p-3 md:p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        {/* Mobile menu toggle */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden mr-3 text-white"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold truncate">{title || 'Business CRM'}</h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Only show add button if onAddNew is provided */}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="bg-primary h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center"
          >
            <PlusIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="bg-dark-300 h-8 md:h-10 px-2 md:px-3 rounded-full flex items-center justify-center text-white"
          >
            <UserIcon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
            <span className="hidden xs:inline">{user?.name?.split(' ')[0]}</span>
            <span className="bg-primary text-xs rounded-full h-4 w-4 flex items-center justify-center ml-1">
              {isAdmin ? 'A' : 'S'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-dark-300 rounded-md shadow-lg z-20">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-dark-200">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs">{user?.email}</div>
                  <div className="text-xs mt-1 uppercase bg-primary bg-opacity-20 text-primary inline-block px-2 py-0.5 rounded">
                    {user?.role}
                  </div>
                </div>

                {/* Admin-only menu items */}
                {isAdmin && (
                  <>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserAddIcon className="h-4 w-4 mr-2" />
                      <span>Register New User</span>
                    </Link>
                  </>
                )}

                {/* Available to all users */}
                <Link
                  to="/reports"
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  <span>View Reports</span>
                </Link>

                {/* Admin reset dashboard option */}
                {isAdmin && title === 'Dashboard' && onReset && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset dashboard data? This cannot be undone.')) {
                        setShowUserMenu(false);
                        onReset();
                      }
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-dark-200"
                  >
                    <RefreshIcon className="h-4 w-4 mr-2" />
                    <span>Reset Dashboard Data</span>
                  </button>
                )}

                {/* Logout option */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-200 border-t border-dark-200"
                >
                  <LogoutIcon className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;