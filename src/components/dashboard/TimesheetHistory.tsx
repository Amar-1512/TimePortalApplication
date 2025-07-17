import React, { useState, useEffect } from 'react';
import { useTimesheet } from '../../hooks/useTimesheet';
import { formatDate } from '../../utils/dateUtils';
import { Timesheet } from '../../types';

interface TimesheetHistoryProps {
  onViewTimesheet: (id: number) => void;
  initialStatusFilter?: string; // New prop for initial filter
}

const TimesheetHistory: React.FC<TimesheetHistoryProps> = ({ onViewTimesheet, initialStatusFilter = 'all' }) => {
  const { timesheets, loadingTimesheets } = useTimesheet();
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    let filtered = [...timesheets].sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ts) => ts.status === statusFilter);
    }

    // Apply date filters
    if (startDate) {
      const startDateObj = new Date(startDate);
      filtered = filtered.filter((ts) => new Date(ts.weekStart) >= startDateObj);
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter((ts) => new Date(ts.weekStart) <= endDateObj);
    }

    setFilteredTimesheets(filtered);
  }, [timesheets, statusFilter, startDate, endDate]);

  const handleFilterChange = () => {
    let filtered = [...timesheets].sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ts) => ts.status === statusFilter);
    }

    if (startDate) {
      const startDateObj = new Date(startDate);
      filtered = filtered.filter((ts) => ts.weekStart >= startDateObj);
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter((ts) => ts.weekStart <= endDateObj);
    }

    setFilteredTimesheets(filtered);
  };

  const statusLabels: Record<string, string> = {
    'not-submitted': 'Not Submitted',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
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

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Previous Timesheets</h2>

      {loadingTimesheets ? (
        <div className="text-center text-gray-500">Loading timesheets...</div>
      ) : (
        <>
          <div className="bg-red-100 p-4 rounded-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-gray-500"
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-500">
              <thead>
                <tr>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(timesheet.weekStart)} - {formatDate(timesheet.weekEnd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                            timesheet.status
                          )}`}
                        >
                          {statusLabels[timesheet.status] || timesheet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.totalHours.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timesheet.submittedDate ? formatDate(timesheet.submittedDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => onViewTimesheet(timesheet.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No timesheets found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TimesheetHistory;

function newDate(weekStart: Date) {
  throw new Error('Function not implemented.');
}
