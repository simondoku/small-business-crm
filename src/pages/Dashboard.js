// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import SalesOverview from '../components/dashboard/SalesOverview';
import TopProducts from '../components/dashboard/TopProducts';
import RecentSales from '../components/dashboard/RecentSales';
import SalesTrend from '../components/dashboard/SalesTrend';
import { getSales } from '../services/salesService';
import { getProducts } from '../services/productService';
import { getCustomers } from '../services/customerService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getUserFeatures } from '../utils/authUtils';
import LoadingScreen from '../components/common/LoadingScreen';
import { 
  RefreshIcon, 
  UserAddIcon, 
  ChevronRightIcon,
  PlusCircleIcon,
  UserGroupIcon,
  CubeIcon
} from '@heroicons/react/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const userFeatures = getUserFeatures(user);
  
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
        
        // Fetch sales, products, and customers
        const [sales, products, customers] = await Promise.all([
          getSales(),
          getProducts(),
          getCustomers()
        ]);
        
        // Process data for different time periods
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const yearStart = new Date(today.getFullYear(), 0, 1);
        
        // Calculate new customers
        const todayCustomers = customers.filter(customer => {
          const customerDate = new Date(customer.createdAt);
          return customerDate >= today;
        }).length;

        const weekCustomers = customers.filter(customer => {
          const customerDate = new Date(customer.createdAt);
          return customerDate >= weekStart;
        }).length;

        const monthCustomers = customers.filter(customer => {
          const customerDate = new Date(customer.createdAt);
          return customerDate >= monthStart;
        }).length;

        const yearCustomers = customers.filter(customer => {
          const customerDate = new Date(customer.createdAt);
          return customerDate >= yearStart;
        }).length;
        
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
          
          return {
            revenue: totalRevenue,
            transactions,
            avgSale
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
            today: { 
              ...calculateMetrics(todaySales),
              newCustomers: todayCustomers 
            },
            week: { 
              ...calculateMetrics(weekSales),
              newCustomers: weekCustomers 
            },
            month: { 
              ...calculateMetrics(monthSales),
              newCustomers: monthCustomers 
            },
            year: { 
              ...calculateMetrics(yearSales),
              newCustomers: yearCustomers 
            }
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
  };
  
  // Handle reset
  const handleReset = async () => {
    if (!userFeatures.resetData) {
      alert('You do not have permission to reset the dashboard.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to reset dashboard data?')) {
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/admin/reset-dashboard');
      window.location.reload();
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      setError('Failed to reset dashboard data.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading dashboard data..." />;
  }

  return (
    <MainLayout 
      title="Dashboard"
      onReset={userFeatures.resetData ? handleReset : undefined}
    >
      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-red-500 flex items-center">
            <RefreshIcon className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      ) : (
        <>
          {/* Welcome message and quick actions */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-400">Here's what's happening with your business today</p>
          </div>
          
          {/* Quick action buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link 
              to="/sales" 
              className="card p-4 flex items-center justify-between hover:shadow-apple-md border border-dark-300/30 transition-all duration-200 hover:border-primary/30 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3">
                  <PlusCircleIcon className="w-5 h-5" />
                </div>
                <span className="font-medium">New Sale</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            </Link>
            
            <Link 
              to="/customers" 
              className="card p-4 flex items-center justify-between hover:shadow-apple-md border border-dark-300/30 transition-all duration-200 hover:border-primary/30 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3">
                  <UserGroupIcon className="w-5 h-5" />
                </div>
                <span className="font-medium">Manage Customers</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            </Link>
            
            <Link 
              to="/products" 
              className="card p-4 flex items-center justify-between hover:shadow-apple-md border border-dark-300/30 transition-all duration-200 hover:border-primary/30 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3">
                  <CubeIcon className="w-5 h-5" />
                </div>
                <span className="font-medium">Manage Products</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            </Link>
          </div>

          {/* Full-width Sales Overview on mobile and tablet */}
          <div className="w-full mb-8">
            <SalesOverview 
              data={dashboardData.salesOverview} 
              onPeriodChange={handlePeriodChange} 
            />
          </div>

          {/* Grid layout that stacks on mobile and becomes 2-column on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SalesTrend 
              data={dashboardData.salesTrend[currentPeriod]} 
              period={currentPeriod} 
            />
            <TopProducts products={dashboardData.topProducts} />
            <RecentSales sales={dashboardData.recentSales} />
            
            {/* Admin-only feature section */}
            {userFeatures.userManagement && (
              <div className="card shadow-apple border border-dark-300/30">
                <div className="p-5 flex items-center border-b border-dark-300/20">
                  <UserAddIcon className="h-5 w-5 text-primary-400 mr-2" />
                  <h2 className="text-lg font-medium">Admin Actions</h2>
                </div>
                <div className="p-5 space-y-3">
                  <Link 
                    to="/register"
                    className="group flex items-center justify-between p-3 bg-dark-300/30 rounded-xl hover:bg-dark-300/50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3">
                        <UserAddIcon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Add New Staff</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  </Link>
                  
                  <Link 
                    to="/users"
                    className="group flex items-center justify-between p-3 bg-dark-300/30 rounded-xl hover:bg-dark-300/50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3">
                        <UserGroupIcon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Manage Users</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  </Link>
                  
                  <button
                    onClick={handleReset}
                    className="group flex items-center justify-between p-3 w-full text-left bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mr-3">
                        <RefreshIcon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-red-400">Reset Dashboard Data</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-red-400/70 transition-colors" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default Dashboard;