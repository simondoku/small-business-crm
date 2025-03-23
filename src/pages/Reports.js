// src/pages/Reports.js
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import DateRangePicker from '../components/common/DateRangePicker';
import { getSales } from '../services/salesService';
import { getCustomers } from '../services/customerService';
import { getProducts } from '../services/productService';
import { getSalesByCategory, getMonthlySales } from '../services/analyticsService';
import { 
  exportToPDF, 
  exportToExcel, 
  formatSalesForExport, 
  formatCustomersForExport 
} from '../utils/reportUtils';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,  // This is needed for Pie charts
    Title,
    Tooltip,
    Legend
  } from 'chart.js';
  
  // Register ChartJS components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,  // This enables the Pie chart
    Title,
    Tooltip,
    Legend
  );

  
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [salesData, setSalesData] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    monthlySales: [],
    categoryRevenue: {}
  });

  // Fetch data based on report type and date range
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (reportType === 'sales' || reportType === 'analytics') {
          const sales = await getSales();
          setSalesData(sales);
          
          if (reportType === 'analytics') {
            // Get additional analytics data
            const monthlySales = await getMonthlySales(new Date().getFullYear());
            const categoryRevenue = await getSalesByCategory(
              dateRange.startDate, dateRange.endDate
            );
            
            setAnalyticsData({
              monthlySales,
              categoryRevenue
            });
          }
        }
        
        if (reportType === 'customers') {
          const customers = await getCustomers();
          setCustomersData(customers);
        }
        
        if (reportType === 'products') {
          const products = await getProducts();
          setProductsData(products);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [reportType, dateRange]);

  // Handle date range change
  const handleDateChange = (range) => {
    setDateRange(range);
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    if (reportType === 'sales') {
      const formattedData = formatSalesForExport(salesData);
      const headers = ['Date', 'Time', 'Customer', 'Items', 'Total'];
      const data = formattedData.map(item => Object.values(item));
      exportToPDF('Sales Report', headers, data, 'sales_report.pdf');
    } else if (reportType === 'customers') {
      const formattedData = formatCustomersForExport(customersData);
      const headers = ['Name', 'Phone', 'Email', 'Address', 'Total Purchases', 'Last Purchase'];
      const data = formattedData.map(item => Object.values(item));
      exportToPDF('Customer Report', headers, data, 'customer_report.pdf');
    }
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    if (reportType === 'sales') {
      const formattedData = formatSalesForExport(salesData);
      exportToExcel(formattedData, 'Sales', 'sales_report.xlsx');
    } else if (reportType === 'customers') {
      const formattedData = formatCustomersForExport(customersData);
      exportToExcel(formattedData, 'Customers', 'customer_report.xlsx');
    }
  };

  // Render the appropriate report content
  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">Loading report data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
    
    switch (reportType) {
      case 'sales':
        return (
          <div className="bg-dark-400 rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">Sales Report</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1 bg-primary text-white rounded-md"
                >
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1 bg-primary text-white rounded-md"
                >
                  Export Excel
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead className="bg-dark-300">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">CUSTOMER</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">ITEMS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">TOTAL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">COMMENTS</th>
                </tr>
                </thead>
            <tbody className="divide-y divide-dark-200">
            {salesData.map((sale, index) => (
                <tr key={sale._id} className={index % 2 === 0 ? 'bg-dark-400' : 'bg-dark-500'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(sale.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {sale.customer?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {sale.items.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${sale.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-white">
                    {sale.comments || '-'}
                </td>
                </tr>
            ))}
            </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'analytics':
        const monthlySalesData = {
          labels: analyticsData.monthlySales.map(item => item.month),
          datasets: [
            {
              label: 'Monthly Revenue',
              data: analyticsData.monthlySales.map(item => item.revenue),
              borderColor: '#8860e6',
              backgroundColor: 'rgba(136, 96, 230, 0.1)',
              fill: true,
            }
          ]
        };
        
        const categoryData = {
          labels: Object.keys(analyticsData.categoryRevenue),
          datasets: [
            {
              data: Object.values(analyticsData.categoryRevenue),
              backgroundColor: [
                '#8860e6', '#60e68a', '#e68a60', '#60b8e6', '#e660b8'
              ],
              borderWidth: 1,
            }
          ]
        };
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-400 rounded-lg overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-medium mb-4">Monthly Revenue</h2>
                <div className="h-64">
                  <Line
                    key={`line-revenue-${reportType}-${dateRange.startDate}`}
                    data={monthlySalesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: '#888888' }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: '#888888' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-dark-400 rounded-lg overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-medium mb-4">Sales Performance</h2>
                <div className="h-64">
                  <Bar
                    key={`bar-${reportType}-${dateRange.startDate}`}
                    data={{
                      labels: ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'],
                      datasets: [
                        {
                          label: 'Sales Count',
                          data: [
                            salesData.filter(sale => new Date(sale.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
                            salesData.filter(sale => new Date(sale.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                            salesData.filter(sale => new Date(sale.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length
                          ],
                          backgroundColor: '#8860e6'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: '#888888' }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: '#888888' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-dark-400 rounded-lg overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-medium mb-4">Sales by Category</h2>
                <div className="h-64">                              
                <Pie
                  key={`pie-${reportType}-${dateRange.startDate}`} 
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                      }
                    }
                  }}
                />
                </div>
              </div>
            </div>
          </div>
        );

        case 'products':
        return (
            <div className="bg-dark-400 rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-medium">Products Report</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-200">
                <thead className="bg-dark-300">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Stock</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                    {productsData.map((product, index) => (
                    <tr key={product._id} className={index % 2 === 0 ? 'bg-dark-400' : 'bg-dark-500'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        ${product.price?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {product.stock}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        );

        case 'customers':
    return (
      <div className="bg-dark-400 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Customers Report</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleExportPDF}
              className="px-3 py-1 bg-primary text-white rounded-md"
            >
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-1 bg-primary text-white rounded-md"
            >
              Export Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200">
            <thead className="bg-dark-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Total Purchases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {customersData.map((customer, index) => (
                <tr key={customer._id} className={index % 2 === 0 ? 'bg-dark-400' : 'bg-dark-500'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {customer.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${customer.totalPurchases ? customer.totalPurchases.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <MainLayout title="Reports">
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'sales' ? 'bg-primary text-white' : 'bg-dark-300 text-white'
            }`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setReportType('analytics')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'analytics' ? 'bg-primary text-white' : 'bg-dark-300 text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setReportType('customers')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'customers' ? 'bg-primary text-white' : 'bg-dark-300 text-white'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setReportType('products')}
            className={`px-4 py-2 rounded-md ${
              reportType === 'products' ? 'bg-primary text-white' : 'bg-dark-300 text-white'
            }`}
          >
            Products
          </button>
        </div>
        
        <DateRangePicker onDateChange={handleDateChange} />
      </div>
      
      {renderReportContent()}
    </MainLayout>
  );
};

export default Reports;