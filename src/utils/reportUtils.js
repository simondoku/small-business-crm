// src/utils/reportUtils.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Export data as PDF
export const exportToPDF = (title, headers, data, filename = 'report.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Create table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [136, 96, 230],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    }
  });
  
  // Save PDF
  doc.save(filename);
};

// Export data as Excel
export const exportToExcel = (data, sheetName = 'Sheet1', filename = 'report.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

// Format sales data for export
export const formatSalesForExport = (sales) => {
  return sales.map(sale => ({
    'Date': new Date(sale.createdAt).toLocaleDateString(),
    'Time': new Date(sale.createdAt).toLocaleTimeString(),
    'Customer': sale.customer?.name || 'Unknown',
    'Items': sale.items.length,
    'Total': `$${sale.totalAmount.toFixed(2)}`
  }));
};

// Format customers data for export
export const formatCustomersForExport = (customers) => {
  return customers.map(customer => ({
    'Name': customer.name,
    'Phone': customer.phone,
    'Email': customer.email || 'N/A',
    'Address': customer.address || 'N/A',
    'Total Purchases': `$${customer.totalPurchases.toFixed(2)}`,
    'Last Purchase': customer.lastPurchaseDate 
      ? new Date(customer.lastPurchaseDate).toLocaleDateString() 
      : 'Never'
  }));
};