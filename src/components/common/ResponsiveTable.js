// src/components/common/ResponsiveTable.js
import React from 'react';

const ResponsiveTable = ({ headers, data, renderRow, emptyMessage = "No data available" }) => {
  // In mobile view, we'll transform the table into a card-based layout
  const isMobile = window.innerWidth < 768; // Simple check, in production you might want to use a hook

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="bg-dark-300 rounded-lg p-4 shadow">
            {headers.map((header, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-dark-200 last:border-0">
                <span className="text-xs text-primary font-medium">{header.label}</span>
                <span className="text-sm text-white text-right">
                  {header.render ? header.render(item) : item[header.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-dark-200">
        <thead className="bg-dark-300">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-200">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;