import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ShoppingCartIcon, CubeIcon, UsersIcon } from '@heroicons/react/outline';

const Sidebar = () => {
  return (
    <div className="fixed inset-y-0 left-0 bg-dark-200 w-16 flex flex-col items-center py-6">
      <div className="w-8 h-8 rounded-full bg-primary mb-8"></div>
      
      <nav className="flex flex-col space-y-8">
        <NavLink to="/" className={({ isActive }) => 
          `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-100'
          }`
        }>
          <HomeIcon className="w-6 h-6" />
        </NavLink>
        
        <NavLink to="/sales" className={({ isActive }) => 
          `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-100'
          }`
        }>
          <ShoppingCartIcon className="w-6 h-6" />
        </NavLink>
        
        <NavLink to="/products" className={({ isActive }) => 
          `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-100'
          }`
        }>
          <CubeIcon className="w-6 h-6" />
        </NavLink>
        
        <NavLink to="/customers" className={({ isActive }) => 
          `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-dark-100'
          }`
        }>
          <UsersIcon className="w-6 h-6" />
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;