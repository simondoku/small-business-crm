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
  XIcon 
} from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Define navigation items with role-based access
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard', roles: ['admin', 'staff'] },
    { path: '/sales', icon: ShoppingCartIcon, label: 'Sales', roles: ['admin', 'staff'] },
    { path: '/products', icon: CubeIcon, label: 'Products', roles: ['admin', 'staff'] },
    { path: '/customers', icon: UsersIcon, label: 'Customers', roles: ['admin', 'staff'] },
    { path: '/reports', icon: ChartBarIcon, label: 'Reports', roles: ['admin', 'staff'] },
    { path: '/register', icon: UserAddIcon, label: 'Add Users', roles: ['admin'] } // Admin only
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  // Mobile sidebar (full-screen overlay)
  const mobileSidebar = (
    <div className={`fixed inset-0 bg-dark-600 bg-opacity-80 z-50 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-dark-200 w-64 h-full transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-dark-300">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary mr-3"></div>
            <div className="text-white">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-100'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  // Desktop sidebar (fixed narrow sidebar)
  const desktopSidebar = (
    <div className="hidden md:flex fixed inset-y-0 left-0 bg-dark-200 w-16 flex-col items-center py-6">
      <div className="w-8 h-8 rounded-full bg-primary mb-8 flex items-center justify-center text-white font-bold">
        {user?.role === 'admin' ? 'A' : 'S'}
      </div>
      
      <nav className="flex flex-col space-y-8">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-100'
              }`
            }
            title={item.label}
          >
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </nav>
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