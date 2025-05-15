// src/components/dashboard/SalesTrend.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { InformationCircleIcon, ChartBarIcon, ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const SalesTrend = ({ data = {}, period = 'today' }) => {
  // Default empty data
  const labels = data.labels || [];
  const values = data.values || [];
  
  // Calculate percentage change if we have at least 2 values
  let percentChange = 0;
  let isIncrease = true;
  
  if (values.length >= 2) {
    const firstValue = values[0] || 0;
    const lastValue = values[values.length - 1] || 0;
    
    if (firstValue > 0) {
      percentChange = ((lastValue - firstValue) / firstValue) * 100;
      isIncrease = percentChange >= 0;
      percentChange = Math.abs(percentChange);
    } else if (lastValue > 0) {
      percentChange = 100;
      isIncrease = true;
    }
  }
  
  // Calculate total revenue for the period
  const totalRevenue = values.reduce((sum, val) => sum + val, 0);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const getGradient = (ctx) => {
    if (!ctx) return null;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(94, 143, 247, 0.5)');
    gradient.addColorStop(1, 'rgba(94, 143, 247, 0.05)');
    return gradient;
  };
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: values,
        borderColor: '#5E8FF7',
        borderWidth: 2,
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          return getGradient(ctx);
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#5E8FF7',
        pointHoverBackgroundColor: '#5E8FF7',
        pointBorderColor: '#FFFFFF',
        pointHoverBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderDash: [3, 3],
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
          padding: 10,
          callback: function(value) {
            if (value >= 1000) {
              return '$' + value / 1000 + 'k';
            }
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
          },
          maxRotation: 0,
          padding: 10,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 30, 0.85)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleFont: {
          weight: 'normal',
          size: 12,
        },
        bodyFont: {
          size: 14,
          weight: 'bold',
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
  };

  // Tooltip content
  const tooltipContent = (
    <div>
      <h3 className="font-medium mb-1">Sales Trend</h3>
      <p>This chart visualizes your sales performance over time, helping you identify patterns and trends.</p>
    </div>
  );

  return (
    <div className="card shadow-apple border border-dark-300/30">
      <div className="p-5 flex justify-between items-center border-b border-dark-300/20">
        <div className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-primary-400 mr-2" />
          <h2 className="text-lg font-medium">Sales Trend</h2>
        </div>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </Tooltip>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
              {period === 'today' ? 'Today' : 
               period === 'week' ? 'This Week' : 
               period === 'month' ? 'This Month' : 'This Year'} Revenue
            </h3>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          
          {values.length >= 2 && (
            <div className={`flex items-center px-2.5 py-1.5 rounded-lg ${isIncrease ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {isIncrease ? 
                <ArrowSmUpIcon className="h-4 w-4 mr-1" /> : 
                <ArrowSmDownIcon className="h-4 w-4 mr-1" />
              }
              <span className="text-sm font-medium">{percentChange.toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className="h-56">
          {labels.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center">
                No sales data available for this period. <br />
                <span className="text-sm text-gray-500 block mt-2">Add sales to see your trend visualization.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesTrend;