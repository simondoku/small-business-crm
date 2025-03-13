// src/components/layout/Header.js
import React from 'react';
import { PlusIcon } from '@heroicons/react/solid';

const Header = ({ title, onAddButton }) => {
  return (
    <header className="bg-dark-400 rounded-lg p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">{title || 'Business CRM'}</h1>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onAddButton}
          className="bg-primary h-10 w-10 rounded-full flex items-center justify-center"
        >
          <PlusIcon className="h-6 w-6 text-white" />
        </button>
      </div>
    </header>
  );
};

export default Header;