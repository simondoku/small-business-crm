// src/utils/reportUtils.js
// Import jsPDF and exceljs
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

// Export data as PDF
export const exportToPDF = (title, headers, data, filename = 'report.pdf') => {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Use the autoTable function directly
  autoTable(doc, {
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

// Export data as Excel using ExcelJS instead of XLSX
export const exportToExcel = async (data, sheetName = 'Sheet1', filename = 'report.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  // If there's data, extract headers from the first item's keys
  if (data.length > 0) {
    // Extract column headers from data keys
    const columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 15 // Set a reasonable column width
    }));
    
    worksheet.columns = columns;
    
    // Add rows from data
    data.forEach(item => {
      worksheet.addRow(item);
    });
    
    // Apply some formatting to header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8860E6' } // Purple color to match PDF export
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' } // White text
      };
    });
  }
  
  // Browser-compatible way to download the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link element to trigger the download
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // Clean up
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);
  }, 100);
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