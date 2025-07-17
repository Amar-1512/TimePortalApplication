import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { useTimesheet } from '../../hooks/useTimesheet';
import { formatDate } from '../../utils/dateUtils';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
 
// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
}
 
const ExportTimesheets: React.FC = () => {
  const { timesheets } = useTimesheet();
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [employee, setEmployee] = useState<string>('all');
  const [showPreview, setShowPreview] = useState<boolean>(false);
 
  // Generate employee options from timesheets
  const employees = [...new Set(timesheets.map(ts => ts.employeeName))].map(name => {
    const sheet = timesheets.find(ts => ts.employeeName === name);
    return {
      id: name,
      name: sheet?.employeeName || 'Unknown'
    };
  });

  const handleGenerateExport = () => {
    setShowPreview(true);
  };
 
  // Filter timesheets for the selected month and employee
  const getFilteredTimesheets = () => {
    const [year, monthNum] = month.split('-').map(n => parseInt(n));
   
    return timesheets.filter(ts => {
      // Check if timesheet is within the selected month
      const tsMonth = ts.weekStart.getMonth() + 1; // JavaScript months are 0-indexed
      const tsYear = ts.weekStart.getFullYear();
      const isMatchingMonth = tsMonth === monthNum && tsYear === year;
     
      // Check employee filter
      const isMatchingEmployee = employee === 'all' || ts.employeeName === employee;
     
      return isMatchingMonth && isMatchingEmployee;
    });
  };
 
  const handleDownloadCSV = () => {
    const filteredTimesheets = getFilteredTimesheets();
    // Flatten timesheet entries to include daily hours per entry type
    const csvData: any[] = [];
    filteredTimesheets.forEach(ts => {
      ts.entries.forEach(entry => {
        csvData.push({
          Employee: ts.employeeName,
          'Week Start': formatDate(ts.weekStart),
          'Week End': formatDate(ts.weekEnd),
          Status: ts.status.charAt(0).toUpperCase() + ts.status.slice(1).replace('-', ' '),
          Type: entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
          Name: entry.name,
          Mon: entry.mon.toFixed(1),
          Tue: entry.tue.toFixed(1),
          Wed: entry.wed.toFixed(1),
          Thu: entry.thu.toFixed(1),
          Fri: entry.fri.toFixed(1),
          Sat: entry.sat.toFixed(1),
          Sun: entry.sun.toFixed(1),
          'Total Hours': (
            entry.mon + entry.tue + entry.wed + entry.thu + entry.fri + entry.sat + entry.sun
          ).toFixed(1),
          'Submitted Date': ts.submittedDate ? formatDate(ts.submittedDate) : '-',
          Comments: ts.comments || '-',
          'Admin Comments': ts.adminComments || '-'
        });
      });
    });
 
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `timesheets_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const handleDownloadPDF = () => {
    const filteredTimesheets = getFilteredTimesheets();
    const doc = new jsPDF() as jsPDFWithAutoTable;
 
    // Add title
    doc.setFontSize(16);
    doc.text('Timesheet Report', 14, 15);
    doc.setFontSize(12);
    doc.text(`Period: ${formatMonthDisplay(month)}`, 14, 25);
 
    // Add summary
    doc.text(`Total Employees: ${[...new Set(filteredTimesheets.map(ts => ts.employeeId))].length}`, 14, 35);
    doc.text(`Total Hours: ${filteredTimesheets.reduce((sum, ts) => sum + ts.totalHours, 0).toFixed(1)}`, 14, 45);
 
    // Flatten timesheet entries for detailed daily hours
    const tableData: any[] = [];
    filteredTimesheets.forEach(ts => {
      ts.entries.forEach(entry => {
        tableData.push([
          ts.employeeName || 'Unknown',
          formatDate(ts.weekStart),
          formatDate(ts.weekEnd),
          entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
          entry.name,
          entry.mon.toFixed(1),
          entry.tue.toFixed(1),
          entry.wed.toFixed(1),
          entry.thu.toFixed(1),
          entry.fri.toFixed(1),
          entry.sat.toFixed(1),
          entry.sun.toFixed(1),
          (
            entry.mon + entry.tue + entry.wed + entry.thu + entry.fri + entry.sat + entry.sun
          ).toFixed(1),
          ts.status.charAt(0).toUpperCase() + ts.status.slice(1).replace('-', ' '),
          ts.submittedDate ? formatDate(ts.submittedDate) : '-'
        ]);
      });
    });
 
    doc.autoTable({
      startY: 55,
      head: [['Employee', 'Week Start', 'Week End', 'Type', 'Name', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total Hours', 'Status', 'Submitted Date']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
 
    doc.save(`timesheets_${month}.pdf`);
  };
 
  const filteredTimesheets = getFilteredTimesheets();
  const totalHours = filteredTimesheets.reduce((sum, ts) => sum + ts.totalHours, 0);
  const uniqueEmployees = [...new Set(filteredTimesheets.map(ts => ts.employeeId))].length;
 
    const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
 
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Export Timesheets</h2>
     
      <div className="bg-red-100 rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="export-month" className="block text-sm font-medium text-red-700 mb-2">
              Select Month:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="month"
                id="export-month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
         
          <div>
            <label htmlFor="export-employee" className="block text-sm font-medium text-red-700 mb-2">
              Employee:
            </label>
            <select
              id="export-employee"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
       
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerateExport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate Export
          </button>
        </div>
      </div>
     
      {showPreview && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Preview</h3>
         
          <div className="bg-gray-50 rounded-md p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Period:</p>
              <p className="text-sm font-medium text-gray-900">{formatMonthDisplay(month)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees:</p>
              <p className="text-sm font-medium text-gray-900">{uniqueEmployees}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours:</p>
              <p className="text-sm font-medium text-gray-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
         
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white  bg-blue-600 hover:bg-gray-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-gray-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
         
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-red-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 bg-red-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 bg-red-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-red-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Total Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTimesheets.length > 0 ? (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {timesheet.employeeName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(timesheet.weekStart)} - {formatDate(timesheet.weekEnd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1).replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timesheet.totalHours.toFixed(1)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No timesheets found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default ExportTimesheets;