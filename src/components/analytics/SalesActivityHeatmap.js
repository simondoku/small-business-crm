// src/components/analytics/SalesActivityHeatmap.js
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const SalesActivityHeatmap = ({ salesData }) => {
  // State for showing click information
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Generate dates for the past year (365 days)
  const getDateInfo = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Create array of all dates in the past year
    const dates = [];
    const currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group by month and week for display
    const monthGroups = [];
    const weeks = [];
    let currentWeek = [];
    
    // Start with the first day of the week containing the first date
    const firstDate = new Date(dates[0]);
    const dayOfWeek = firstDate.getDay();
    const startDate = new Date(firstDate);
    startDate.setDate(firstDate.getDate() - dayOfWeek);
    
    // Fill the first week with empty cells if needed
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    // Process all dates
    dates.forEach(date => {
      const month = date.getMonth();
      const dayOfWeek = date.getDay();
      
      // Track first day of each month for labels
      if (date.getDate() === 1) {
        monthGroups.push({
          month: date.toLocaleString('default', { month: 'short' }),
          index: monthGroups.length,
          weekIndex: Math.floor((currentWeek.length + weeks.length * 7) / 7)
        });
      }
      
      // Add date to current week
      currentWeek.push(date);
      
      // Start a new week after Sunday (6) or if we've reached today
      if (dayOfWeek === 6 || date.getTime() === today.getTime()) {
        // If week isn't full, pad with empty cells
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return {
      dates,
      weeks,
      monthGroups
    };
  }, []);
  
  // Calculate sales intensity for each date
  const dateActivities = useMemo(() => {
    const activities = {};
    
    // Count sales for each date
    salesData.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      const dateString = saleDate.toISOString().split('T')[0];
      
      if (!activities[dateString]) {
        activities[dateString] = {
          count: 0,
          amount: 0
        };
      }
      
      activities[dateString].count++;
      activities[dateString].amount += sale.totalAmount;
    });
    
    // Find maximum values for normalization
    let maxSalesCount = 0;
    let maxSalesAmount = 0;
    
    Object.values(activities).forEach(activity => {
      maxSalesCount = Math.max(maxSalesCount, activity.count);
      maxSalesAmount = Math.max(maxSalesAmount, activity.amount);
    });
    
    return {
      activities,
      maxSalesCount,
      maxSalesAmount
    };
  }, [salesData]);
  
  // Get intensity level (0-4) for a given date
  const getIntensityLevel = (date) => {
    if (!date) return -1; // No date provided
    
    const dateString = date.toISOString().split('T')[0];
    const activity = dateActivities.activities[dateString];
    
    if (!activity) return 0; // No activity
    
    const { count, amount } = activity;
    const { maxSalesCount, maxSalesAmount } = dateActivities;
    
    // Calculate intensity based on both count and amount
    // We'll weight count more heavily than amount
    const countRatio = maxSalesCount > 0 ? count / maxSalesCount : 0;
    const amountRatio = maxSalesAmount > 0 ? amount / maxSalesAmount : 0;
    
    // Combined intensity (weighted)
    const intensity = (countRatio * 0.7) + (amountRatio * 0.3);
    
    // Map to 5 levels (0-4)
    if (intensity === 0) return 0;
    if (intensity <= 0.25) return 1;
    if (intensity <= 0.5) return 2;
    if (intensity <= 0.75) return 3;
    return 4;
  };
  
  // Get color for intensity level
  const getIntensityColor = (level) => {
    switch (level) {
      case 0: return 'bg-dark-300';            // No sales
      case 1: return 'bg-purple-900/30';       // Low sales
      case 2: return 'bg-purple-700/50';       // Medium sales
      case 3: return 'bg-purple-500/70';       // High sales
      case 4: return 'bg-purple-400';          // Very high sales
      default: return 'bg-dark-500';           // Empty cell
    }
  };
  
  // Get hover class for better user interaction
  const getHoverClass = (level) => {
    if (level < 0) return '';
    return 'hover:ring-2 hover:ring-white/20 hover:scale-105 transition-all cursor-pointer';
  };
  
  // Format tooltip text for a date
  const getTooltipText = (date) => {
    if (!date) return '';
    
    const dateString = date.toISOString().split('T')[0];
    const activity = dateActivities.activities[dateString];
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!activity) {
      return `No sales on ${formattedDate}`;
    }
    
    return `${activity.count} ${activity.count === 1 ? 'sale' : 'sales'} on ${formattedDate}`;
  };

  // Handle cell click
  const handleCellClick = (date) => {
    if (!date) return;
    setSelectedDay(date);
  };

  // Format selection text like GitHub
  const getSelectionText = () => {
    if (!selectedDay) return null;
    
    const dateString = selectedDay.toISOString().split('T')[0];
    const activity = dateActivities.activities[dateString];
    const formattedDate = selectedDay.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!activity) {
      return `No sales on ${formattedDate}`;
    }
    
    return `${activity.count} ${activity.count === 1 ? 'sale' : 'sales'} on ${formattedDate}`;
  };
  
  // Render the week day labels
  const renderWeekdayLabels = () => {
    const weekdays = ['Sun', 'Mon', '', 'Wed', '', 'Fri', ''];
    return (
      <div className="flex flex-col gap-2 text-xs text-gray-400 mr-2 mt-7">
        {weekdays.map((day, index) => (
          <div key={index} className="h-4 flex items-center">
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  // Render month labels
  const renderMonthLabels = () => {
    return (
      <div className="relative text-xs text-gray-400 h-6 ml-14">
        {getDateInfo.monthGroups.map((month, index) => (
          <div
            key={index}
            className="absolute top-0"
            style={{ left: `${month.weekIndex * 20}px` }}
          >
            {month.month}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-dark-400 rounded-lg p-4 w-full">
      {/* Selection popup similar to GitHub */}
      {selectedDay && (
        <div className="mb-4 bg-dark-300 text-white text-sm py-1 px-3 rounded-lg inline-block">
          {getSelectionText()}
        </div>
      )}

      {renderMonthLabels()}
      
      <div className="flex overflow-x-auto">
        {renderWeekdayLabels()}
        
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {getDateInfo.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date, dayIndex) => {
                  const intensityLevel = getIntensityLevel(date);
                  const tooltipText = getTooltipText(date);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-4 h-4 rounded-sm ${getIntensityColor(intensityLevel)} ${getHoverClass(intensityLevel)}`}
                      title={tooltipText}
                      onClick={() => handleCellClick(date)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-xs text-gray-400">Less</span>
        <div className={`w-3 h-3 rounded-sm ${getIntensityColor(0)}`} />
        <div className={`w-3 h-3 rounded-sm ${getIntensityColor(1)}`} />
        <div className={`w-3 h-3 rounded-sm ${getIntensityColor(2)}`} />
        <div className={`w-3 h-3 rounded-sm ${getIntensityColor(3)}`} />
        <div className={`w-3 h-3 rounded-sm ${getIntensityColor(4)}`} />
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  );
};

SalesActivityHeatmap.propTypes = {
  salesData: PropTypes.array.isRequired
};

export default SalesActivityHeatmap;
