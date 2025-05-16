// src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  UsersIcon, 
  ChartBarIcon,
  UserAddIcon,
  XIcon,
  UserCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, isExpanded, onToggleExpand }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Define navigation items with role-based access
  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', roles: ['admin', 'staff'] },
    { path: '/sales', icon: ShoppingCartIcon, label: 'Sales', roles: ['admin', 'staff'] },
    { path: '/products', icon: CubeIcon, label: 'Products', roles: ['admin', 'staff'] },
    { path: '/customers', icon: UsersIcon, label: 'Customers', roles: ['admin', 'staff'] },
    { path: '/reports', icon: ChartBarIcon, label: 'Reports', roles: ['admin', 'staff'] },
    { path: '/profile', icon: UserCircleIcon, label: 'Profile', roles: ['admin', 'staff'] },
    { path: '/register', icon: UserAddIcon, label: 'Add Users', roles: ['admin'] } // Admin only
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  // Mobile sidebar (full-screen overlay)
  const mobileSidebar = (
    <div className={`fixed inset-0 bg-dark-500/80 backdrop-blur-sm z-50 md:hidden transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-dark-300/95 backdrop-blur-md w-72 h-full shadow-apple-lg transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-dark-200/30">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-md flex items-center justify-center text-white font-bold mr-3">
              {user?.name?.split(' ').map(n => n?.[0]).join('').toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-medium text-white">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1.5 hover:bg-dark-200 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-3">
          <div className="mb-2 px-3 pt-4 pb-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</p>
          </div>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center py-2.5 px-3 rounded-lg mb-1 transition-all ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400' 
                    : 'text-gray-300 hover:text-white hover:bg-dark-200/50'
                }`
              }
            >
              <item.icon className={`w-5 h-5 mr-3 text-gray-400`} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  // Desktop sidebar (expandable sidebar)
  const desktopSidebar = (
    <div className={`hidden md:flex fixed inset-y-0 left-0 bg-dark-400/50 backdrop-blur-md ${isExpanded ? 'w-64' : 'w-16'} flex-col items-center transition-all duration-300 shadow-apple z-20`}>
      <div className="flex items-center justify-center w-full py-8">
        <div className="w-9 h-9 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        {isExpanded && (
          <div className="ml-3 font-bold text-white text-lg">Business CRM</div>
        )}
      </div>
      
      <nav className={`flex flex-col w-full ${isExpanded ? 'px-4' : 'items-center'} space-y-6`}>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              isExpanded 
                ? `flex items-center py-2.5 px-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary-500/10 text-primary-400' 
                      : 'text-gray-300 hover:text-white hover:bg-dark-200/50'
                  }`
                : `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group ${
                    isActive 
                      ? 'bg-primary-500/20 text-primary shadow-sm' 
                      : 'text-gray-400 hover:text-white hover:bg-dark-300/80'
                  }`
            }
            title={isExpanded ? '' : item.label}
          >
            <item.icon className={isExpanded ? "w-5 h-5 mr-3" : "w-5 h-5"} />
            
            {isExpanded ? (
              <span className="font-medium text-sm">{item.label}</span>
            ) : (
              <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium rounded bg-dark-200 text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap">
                {item.label}
              </span>
            )}
            
            {!isExpanded && (
              <NavLink to={item.path} className={({ isActive }) => 
                isActive ? "absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" : "hidden"
              }></NavLink>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Toggle expand button */}
      <button 
        onClick={onToggleExpand}
        className="absolute bottom-5 right-0 transform translate-x-1/2 bg-dark-300 hover:bg-dark-200 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white shadow-lg transition-colors"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded 
          ? <ChevronLeftIcon className="w-4 h-4" /> 
          : <ChevronRightIcon className="w-4 h-4" />
        }
      </button>
    </div>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
};

export default Sidebar;