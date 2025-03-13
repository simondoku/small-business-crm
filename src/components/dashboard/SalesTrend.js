// src/components/dashboard/SalesTrend.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { InformationCircleIcon } from '@heroicons/react/outline';
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
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data: values,
        borderColor: '#8860e6',
        backgroundColor: 'rgba(136, 96, 230, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#888888',
          callback: function(value) {
            return '$' + value;
          }
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
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(50, 50, 50, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        displayColors: false,
        callbacks: {
          label: function(context) {
            return '$' + context.parsed.y;
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
    <div className="bg-dark-400 rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Sales Trend</h2>
        <Tooltip content={tooltipContent} position="left">
          <InformationCircleIcon className="h-5 w-5 text-primary cursor-pointer" />
        </Tooltip>
      </div>
      
      <div className="p-4 pt-0 h-64">
        {labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No sales data available for this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTrend;