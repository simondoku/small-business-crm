// src/components/layout/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  PlusIcon, 
  UserIcon, 
  LogoutIcon, 
  RefreshIcon, 
  MenuIcon, 
  UserAddIcon,
  ChartBarIcon,
  CogIcon,
  EyeOffIcon,
  EyeIcon
} from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const Header = ({ 
  title, 
  onAddNew, 
  onReset, 
  onToggleSidebar,
  focusMode,
  toggleFocusMode
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const isOnSalesPage = location.pathname === '/sales';

  return (
    <header className={`${focusMode ? 'bg-dark-500/95' : 'bg-dark-400/90'} backdrop-blur-md p-3 md:p-4 flex justify-between items-center sticky top-0 z-30 shadow-apple transition-all duration-300`}>
      <div className="flex items-center">
        {/* Mobile menu toggle - hidden in focus mode */}
        {!focusMode && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden mr-3 text-white hover:bg-dark-300 p-1.5 rounded-lg transition-colors"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Logo and title - now with improved spacing for sidebar */}
        <div className="flex items-center md:pl-0">
          <div className={`h-7 w-7 bg-gradient-to-r ${focusMode ? 'from-primary-600 to-primary-800' : 'from-primary-400 to-primary-600'} rounded-lg shadow-lg flex items-center justify-center mr-2.5 ${focusMode ? '' : 'md:hidden'}`}>
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <h1 className="text-lg md:text-xl font-medium tracking-tight text-white">{focusMode ? 'Focus Mode' : title || 'BusinessCRM'}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Focus Mode Toggle Button */}
        <div className="relative group">
          <button
            onClick={toggleFocusMode}
            className={`${focusMode ? 'bg-primary' : 'bg-dark-300 hover:bg-dark-200'} h-9 px-3 rounded-full flex items-center justify-center text-white transition-colors`}
            aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
          >
            {focusMode ? (
              <>
                <EyeIcon className="h-4 w-4 text-white mr-1.5" />
                <span className="text-sm font-medium">Exit Focus</span>
              </>
            ) : (
              <>
                <EyeOffIcon className="h-4 w-4 text-gray-300 mr-1.5" />
                <span className="hidden sm:inline text-sm font-medium">Focus Mode</span>
                {!isOnSalesPage && <span className="hidden md:inline text-xs ml-1 opacity-70">(→ Sales)</span>}
              </>
            )}
          </button>
          
          {/* Tooltip for focus mode */}
          {!focusMode && !isOnSalesPage && (
            <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-dark-200 text-xs py-1 px-2 rounded whitespace-nowrap text-white">
              Will take you to Sales page
            </div>
          )}
        </div>

        {/* Only show add button if onAddNew is provided and not in focus mode */}
        {onAddNew && !focusMode && (
          <button
            onClick={onAddNew}
            className="bg-primary hover:bg-primary-600 h-9 w-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
            aria-label="Add new"
          >
            <PlusIcon className="h-5 w-5 text-white" />
          </button>
        )}

        {/* User menu - simplified in focus mode */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`${focusMode ? 'bg-dark-400' : 'bg-dark-300'} hover:bg-dark-200 h-9 px-3 rounded-full flex items-center justify-center text-white transition-colors`}
            aria-label="User menu"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center mr-1.5">
              <UserIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            {!focusMode && <span className="hidden xs:inline text-sm font-medium">{user?.name?.split(' ')[0]}</span>}
            {isAdmin && !focusMode && (
              <span className="bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center ml-1.5">
                A
              </span>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-dark-300/95 backdrop-blur-md rounded-xl shadow-apple-lg border border-dark-200/50 z-40 overflow-hidden animate-fadeIn">
              <div className="py-1">
                {/* User info */}
                <div className="px-4 py-3 border-b border-dark-200/50">
                  <div className="font-medium text-white">{user?.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
                  <div className="text-xs mt-2 font-medium bg-primary-500/10 text-primary-400 inline-block px-2 py-0.5 rounded-full">
                    {user?.role}
                  </div>
                </div>

                {/* In focus mode, show limited options */}
                {focusMode ? (
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        toggleFocusMode();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-200/50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Exit Focus Mode</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-200/50 transition-colors"
                    >
                      <LogoutIcon className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="py-1">
                      {/* Profile link */}
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-200/50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
                        <span>Profile Settings</span>
                      </Link>

                      {/* Admin-only menu items */}
                      {isAdmin && (
                        <Link
                          to="/register"
                          className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-200/50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserAddIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <span>Register New User</span>
                        </Link>
                      )}

                      {/* Reports link */}
                      <Link
                        to="/reports"
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-dark-200/50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-3 text-gray-400" />
                        <span>View Reports</span>
                      </Link>
                    </div>

                    {/* Admin reset dashboard option */}
                    {isAdmin && title === 'Dashboard' && onReset && (
                      <div className="border-t border-dark-200/50 py-1">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to reset dashboard data? This cannot be undone.')) {
                              setShowUserMenu(false);
                              onReset();
                            }
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-200/50 transition-colors"
                        >
                          <RefreshIcon className="h-4 w-4 mr-3" />
                          <span>Reset Dashboard Data</span>
                        </button>
                      </div>
                    )}

                    {/* Logout option */}
                    <div className="border-t border-dark-200/50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-200/50 transition-colors"
                      >
                        <LogoutIcon className="h-4 w-4 mr-3 text-gray-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;