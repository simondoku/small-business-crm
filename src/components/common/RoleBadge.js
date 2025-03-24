// src/components/common/RoleBadge.js
import React from 'react';

const RoleBadge = ({ role }) => {
  let bgColor = 'bg-gray-500';
  let textColor = 'text-white';
  
  if (role === 'admin') {
    bgColor = 'bg-primary';
    textColor = 'text-white';
  } else if (role === 'staff') {
    bgColor = 'bg-green-600';
    textColor = 'text-white';
  }
  
  return (
    <span className={`${bgColor} ${textColor} text-xs font-medium px-2 py-0.5 rounded`}>
      {role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : role}
    </span>
  );
};

export default RoleBadge;