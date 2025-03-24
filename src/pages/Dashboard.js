// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SalesOverview from '../components/dashboard/SalesOverview';
import TopProducts from '../components/dashboard/TopProducts';
import RecentSales from '../components/dashboard/RecentSales';
import SalesTrend from '../components/dashboard/SalesTrend';
import { getSales } from '../services/salesService';
import { getProducts } from '../services/productService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('today');
  const [dashboardData, setDashboardData] = useState({
    salesOverview: {
      today: { revenue: 0, transactions: 0, avgSale: 0, newCustomers: 0 },
      week: { revenue: 0, transactions: 0, avgSale: 0, newCustomers: 0 },
      month: { revenue: 0, transactions: 0, avgSale: 0, newCustomers: 0 },
      year: { revenue: 0, transactions: 0, avgSale: 0, newCustomers: 0 }
    },
    topProducts: [],
    recentSales: [],
    salesTrend: {
      today: { labels: [], values: [] },
      week: { labels: [], values: [] },
      month: { labels: [], values: [] },
      year: { labels: [], values: [] }
    }
  });

  // Fetch and process data based on time period
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch sales and products
        const [sales, products] = await Promise.all([
          getSales(),
          getProducts()
        ]);
        
        console.log('Fetched sales:', sales);
        console.log('Fetched products:', products);
        
        // Process data for different time periods
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const yearStart = new Date(today.getFullYear(), 0, 1);
        
        // Filter sales by period
        const todaySales = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= today;
        });
        
        const weekSales = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= weekStart;
        });
        
        const monthSales = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= monthStart;
        });
        
        const yearSales = sales.filter(sale => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= yearStart;
        });
        
        // Calculate metrics for each period
        const calculateMetrics = (salesData) => {
          const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
          const transactions = salesData.length;
          const avgSale = transactions > 0 ? (totalRevenue / transactions) : 0;
          
          // You would need to track new customers in a real app
          // For now, we'll just use a placeholder
          const newCustomers = 0;
          
          return {
            revenue: totalRevenue,
            transactions,
            avgSale,
            newCustomers
          };
        };
        
        // Calculate top products
        const productSales = {};
        
        // Process sales to calculate product quantities
        sales.forEach(sale => {
          sale.items.forEach(item => {
            const productName = item.name || "Deleted Product";
            
            // Use product name as the key instead of product ID
            if (productSales[productName]) {
              productSales[productName] += item.quantity;
            } else {
              productSales[productName] = item.quantity;
            }
          });
        });
        
        const topProducts = Object.entries(productSales)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
        
        // Format recent sales
        const recentSales = sales
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(sale => {
            const saleDate = new Date(sale.createdAt);
            
            return {
              customer: sale.customer?.name || 'Unknown',
              product: sale.items[0]?.name || 'Multiple items',
              amount: sale.totalAmount,
              // Add formatted date (MM/DD/YYYY)
              date: saleDate.toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric' 
              }),
              // Time as before (HH:MM)
              time: saleDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            };
          });
        
        // Generate sales trend data based on selected period
        const generateTrendData = (periodSales, period) => {
          // Default to empty data
          if (!periodSales || periodSales.length === 0) {
            return { labels: [], values: [] };
          }

          // Sort sales by date
          const sortedSales = [...periodSales].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );

          // Different grouping based on period
          let groupedSales = {};
          let labels = [];

          switch(period) {
            case 'today':
              // Group by hour for today
              sortedSales.forEach(sale => {
                const date = new Date(sale.createdAt);
                const hour = date.getHours();
                const hourLabel = `${hour}:00`;
                
                if (!groupedSales[hourLabel]) {
                  groupedSales[hourLabel] = 0;
                }
                groupedSales[hourLabel] += sale.totalAmount;
              });
              
              // Create full day labels (24 hours)
              for (let i = 0; i < 24; i++) {
                const hourLabel = `${i}:00`;
                labels.push(hourLabel);
                if (!groupedSales[hourLabel]) {
                  groupedSales[hourLabel] = 0;
                }
              }
              break;
              
            case 'week':
              // Group by day for week
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              sortedSales.forEach(sale => {
                const date = new Date(sale.createdAt);
                const day = date.getDay(); // 0-6
                const dayLabel = dayNames[day];
                
                if (!groupedSales[dayLabel]) {
                  groupedSales[dayLabel] = 0;
                }
                groupedSales[dayLabel] += sale.totalAmount;
              });
              
              // Create full week labels
              labels = dayNames;
              dayNames.forEach(day => {
                if (!groupedSales[day]) {
                  groupedSales[day] = 0;
                }
              });
              break;
              
            case 'month':
              // Group by date for month
              sortedSales.forEach(sale => {
                const date = new Date(sale.createdAt);
                const dayOfMonth = date.getDate();
                const dayLabel = dayOfMonth.toString();
                
                if (!groupedSales[dayLabel]) {
                  groupedSales[dayLabel] = 0;
                }
                groupedSales[dayLabel] += sale.totalAmount;
              });
              
              // Create month labels (1-31)
              const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              for (let i = 1; i <= daysInMonth; i++) {
                const dayLabel = i.toString();
                labels.push(dayLabel);
                if (!groupedSales[dayLabel]) {
                  groupedSales[dayLabel] = 0;
                }
              }
              break;
              
            case 'year':
              // Group by month for year
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              sortedSales.forEach(sale => {
                const date = new Date(sale.createdAt);
                const month = date.getMonth(); // 0-11
                const monthLabel = monthNames[month];
                
                if (!groupedSales[monthLabel]) {
                  groupedSales[monthLabel] = 0;
                }
                groupedSales[monthLabel] += sale.totalAmount;
              });
              
              // Create full year labels
              labels = monthNames;
              monthNames.forEach(month => {
                if (!groupedSales[month]) {
                  groupedSales[month] = 0;
                }
              });
              break;
              
            default:
              break;
          }

          // Convert the grouped data to arrays for the chart
          const values = labels.map(label => groupedSales[label] || 0);
          
          return { labels, values };
        };

        // Generate trend data for each period
        const trendData = {
          today: generateTrendData(todaySales, 'today'),
          week: generateTrendData(weekSales, 'week'),
          month: generateTrendData(monthSales, 'month'),
          year: generateTrendData(yearSales, 'year')
        };
        
        // Update dashboard data
        setDashboardData({
          salesOverview: {
            today: calculateMetrics(todaySales),
            week: calculateMetrics(weekSales),
            month: calculateMetrics(monthSales),
            year: calculateMetrics(yearSales)
          },
          topProducts,
          recentSales,
          salesTrend: trendData
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle period change
  const handlePeriodChange = (period) => {
    setCurrentPeriod(period);
    console.log('Period changed to:', period);
  };
  
  // Handle reset
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset dashboard data?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the backend reset endpoint
      await api.post('/admin/reset-dashboard');
      
      // Refetch data
      const fetchDashboardData = async () => {
        try {
          // Fetch sales and products
          window.location.reload();
          
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
          setError('Failed to load dashboard data. Please try again.');
          setLoading(false);
        }
      };
      
      fetchDashboardData();
      
      alert('Dashboard data reset successfully!');
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      setError('Failed to reset dashboard data.');
      setLoading(false);
    }
  };

  
return (
  <MainLayout 
    title="Dashboard"
    onReset={user?.role === 'admin' ? handleReset : undefined}
  >
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-400">Loading dashboard data...</p>
      </div>
    ) : error ? (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
        <p className="text-red-500">{error}</p>
      </div>
    ) : (
      <div className="space-y-6">
        {/* Full-width Sales Overview on mobile and tablet */}
        <div className="w-full">
          <SalesOverview 
            data={dashboardData.salesOverview} 
            onPeriodChange={handlePeriodChange} 
          />
        </div>

        {/* Grid layout that stacks on mobile and becomes 2-column on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopProducts products={dashboardData.topProducts} />
          <RecentSales sales={dashboardData.recentSales} />
          <SalesTrend 
            data={dashboardData.salesTrend[currentPeriod]} 
            period={currentPeriod} 
          />
          {/* If you have a fourth panel, it would go here */}
        </div>
      </div>
    )}
  </MainLayout>
);
};

export default Dashboard;