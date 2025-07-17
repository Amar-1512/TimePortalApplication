import React, { useState, useEffect } from 'react';
import { Timesheet } from '../../types';
import { useTimesheet } from '../../hooks/useTimesheet';
import { useUsers } from '../../context/UserContext';
import { formatDate, formatDateForInput } from '../../utils/dateUtils';
import TimesheetModal from '../dashboard/TimesheetModal';

const AllTimesheets: React.FC = () => {
  const { timesheets } = useTimesheet();
  const { users } = useUsers();
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(null);

  // Filter states
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Generate employee list from unique employee names in timesheets
  const employees = [...new Set(timesheets.map(ts => ts.employeeName))].map(name => ({
    id: name,
    name: name || 'Unknown',
  }));

  useEffect(() => {
    // Sort timesheets by date (newest first)
    const sortedTimesheets = [...timesheets].sort((a, b) =>
      (b.weekStart?.getTime() || 0) - (a.weekStart?.getTime() || 0)
    );
    setFilteredTimesheets(sortedTimesheets);

    // Initialize date filters with last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setStartDate(formatDateForInput(thirtyDaysAgo));
    setEndDate(formatDateForInput(today));
  }, [timesheets]);

  // Add effect to re-apply filters when filter states change
  React.useEffect(() => {
    let filtered = [...timesheets].sort((a, b) =>
      (b.weekStart?.getTime() || 0) - (a.weekStart?.getTime() || 0)
    );

    // Apply employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(ts => ts.employeeName === employeeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ts => ts.status === statusFilter);
    }

    // Apply date filters
    if (startDate) {
      const startDateObj = new Date(startDate);
      filtered = filtered.filter(ts => (ts.weekStart ?? new Date(0)) >= startDateObj);
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(ts => (ts.weekStart ?? new Date(0)) <= endDateObj);
    }

    setFilteredTimesheets(filtered);
  }, [employeeFilter, statusFilter, startDate, endDate, timesheets]);

  const handleFilterChange = () => {
    let filtered = [...timesheets].sort((a, b) =>
      (b.weekStart?.getTime() || 0) - (a.weekStart?.getTime() || 0)
    );

  // Apply employee filter
  if (employeeFilter !== 'all') {
    filtered = filtered.filter(ts => ts.employeeName === employeeFilter);
  }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ts => ts.status === statusFilter);
    }

    // Apply date filters
    if (startDate) {
      const startDateObj = new Date(startDate);
      filtered = filtered.filter(ts => (ts.weekStart || new Date(0)) >= startDateObj);
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(ts => (ts.weekStart || new Date(0)) <= endDateObj);
    }

    setFilteredTimesheets(filtered);
  };

  const viewTimesheet = (id: number) => {
    setSelectedTimesheetId(id);
    setShowModal(true);
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabels: Record<string, string> = {
    'not-submitted': 'Not Submitted',
    'submitted': 'Submitted',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">All Employee Timesheets</h2>

      <div className="bg-red-100 p-4 rounded-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="employee-filter" className="block text-sm font-medium text-red-700 mb-1">
              Employee:
            </label>
            <select
              id="employee-filter"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-red-700 mb-1">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All</option>
              <option value="not-submitted">Not Submitted</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-red-700 mb-1">
              Start Date:
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-red-700 mb-1">
              End Date:
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Apply Filters
          </button>
        </div>
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
              <th className="px-6 py-3 bg-red-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="px-6 py-3 bg-red-600 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-500">
            {filteredTimesheets.length > 0 ? (
              filteredTimesheets.map((timesheet) => (
                <tr key={timesheet.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {timesheet.employeeName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.weekStart ? formatDate(timesheet.weekStart) : '-'} - {timesheet.weekEnd ? formatDate(timesheet.weekEnd) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(timesheet.status)}`}>
                      {statusLabels[timesheet.status] || timesheet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.totalHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.submittedDate ? formatDate(timesheet.submittedDate) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewTimesheet(timesheet.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No timesheets found matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedTimesheetId && (
        <TimesheetModal
          timesheetId={selectedTimesheetId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AllTimesheets;
