// src/components/common/DateRangePicker.js
import React, { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/solid';

const DateRangePicker = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleApply = () => {
    onDateChange({ startDate, endDate });
  };
  
  return (
    <div className="bg-dark-400 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <CalendarIcon className="h-5 w-5 text-primary mr-2" />
        <h3 className="text-sm font-medium text-white">Date Range</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 rounded-md bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 rounded-md bg-dark-300 text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;