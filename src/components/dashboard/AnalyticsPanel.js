// src/components/dashboard/AnalyticsPanel.js
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { InformationCircleIcon } from '@heroicons/react/outline';
import Tooltip from '../common/Tooltip';

const AnalyticsPanel = ({ salesData }) => {
  // Calculate metrics
  const monthlySales = salesData.monthlyRevenue || [];
  const categorySales = salesData.categoryRevenue || {};
  
  // Format data for charts
  const barChartData = {
    labels: monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlySales.map(item => item.revenue),
        backgroundColor: '#8860e6',
      }
    ]
  };
  
  const pieChartData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        data: Object.values(categorySales),
        backgroundColor: [
          '#8860e6', '#60e68a', '#e68a60', '#60b8e6', '#e660b8'
        ],
        borderWidth: 1,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#888888',
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#ffffff',
        }
      },
    },
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#ffffff',
        }
      },
    },
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-dark-400 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Monthly Revenue</h2>
          <Tooltip content="Shows revenue trends by month">
            <InformationCircleIcon className="h-5 w-5 text-primary cursor-pointer" />
          </Tooltip>
        </div>
        <div className="p-4 h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-dark-400 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Sales by Category</h2>
          <Tooltip content="Distribution of sales across product categories">
            <InformationCircleIcon className="h-5 w-5 text-primary cursor-pointer" />
          </Tooltip>
        </div>
        <div className="p-4 h-64">
          <Pie data={pieChartData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;