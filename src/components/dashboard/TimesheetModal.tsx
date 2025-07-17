import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTimesheet } from '../../hooks/useTimesheet';
import { Timesheet, DailyTotal } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface TimesheetModalProps {
  timesheetId: number;
  onClose: () => void;
}

const TimesheetModal: React.FC<TimesheetModalProps> = ({ timesheetId, onClose }) => {
  const { timesheets, calculateDailyTotals, calculateWeeklyTotal } = useTimesheet();
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal>({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0 ,sat:0, sun:0});
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);

  useEffect(() => {
    const found = timesheets.find(ts => ts.id === timesheetId);
    if (found) {
      setTimesheet(found);
      const totals = calculateDailyTotals(found.entries || []);
      setDailyTotals(totals);
      setWeeklyTotal(calculateWeeklyTotal(totals));
    }
  }, [timesheetId, timesheets, calculateDailyTotals, calculateWeeklyTotal]);

  if (!timesheet) {
    return null;
  }

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

  const days: Array<keyof DailyTotal> = ['mon', 'tue', 'wed', 'thu', 'fri','sat','sun'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat','Sun'];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Timesheet Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Week:</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(timesheet.weekStart)} - {formatDate(timesheet.weekEnd)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status:</p>
              <p className="text-sm font-medium">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(timesheet.status)}`}>
                  {statusLabels[timesheet.status] || timesheet.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted:</p>
              <p className="text-sm font-medium text-gray-900">
                {timesheet.submittedDate ? formatDate(timesheet.submittedDate) : '-'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-red-600 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Category
                  </th>
                  {dayLabels.map((day) => (
                    <th key={day} className="px-6 py-3 bg-red-600 text-left text-xs font-bold text-white uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                  <th className="px-6 py-3 bg-red-600 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(timesheet.entries || []).map((entry, index) => {
                  const rowTotal = days.reduce((sum, day) => sum + (entry[day] || 0), 0);
                  return (
                    <tr key={`${entry.type}-${entry.name}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(entry.type === 'leave' || entry.type === 'sick') ? 'Leave' : entry.name}
                      </td>
                      {days.map((day) => (
                        <td key={`${entry.type}-${entry.name}-${day}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry[day] || 0}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rowTotal.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    Daily Total
                  </td>
                  {days.map((day) => (
                    <td key={`total-${day}`} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {dailyTotals[day].toFixed(1)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {weeklyTotal.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {timesheet.comments && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Comments</h3>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                {timesheet.comments}
              </p>
            </div>
          )}

          {timesheet.adminComments && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Admin Comments</h3>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                {timesheet.adminComments}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimesheetModal;
