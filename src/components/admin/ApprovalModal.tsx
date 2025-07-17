import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Timesheet, DailyTotal } from '../../types';
import { useTimesheet } from '../../hooks/useTimesheet';
import { formatDate } from '../../utils/dateUtils';

interface ApprovalModalProps {
  timesheet: Timesheet;
  onClose: () => void;
  onApprove: (id: number, comments?: string) => void;
  onReject: (id: number, comments: string) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ 
  timesheet, 
  onClose,
  onApprove, 
  onReject 
}) => {
  const [adminComments, setAdminComments] = useState('');
  const { calculateDailyTotals, calculateWeeklyTotal } = useTimesheet();

  // Ensure "leave" entry exists
  const hasLeaveEntry = timesheet.entries.some(
    (entry) => entry.name.trim().toLowerCase() === 'leave'
  );
  const entriesWithLeave = hasLeaveEntry
    ? timesheet.entries
    : [
        ...timesheet.entries,
        {
          type: 'leave' as const,
          name: 'Leave',
          mon: 0,
          tue: 0,
          wed: 0,
          thu: 0,
          fri: 0,
          sat:0,
          sun:0,
          // Add any other required properties with default values
          id: -1,
          projectId: null,
          description: '',
          date: null,
        },
      ];

  const dailyTotals = calculateDailyTotals(entriesWithLeave);
  const weeklyTotal = calculateWeeklyTotal(dailyTotals);

  const handleApprove = () => {
    onApprove(timesheet.id, adminComments);
  };

  const handleReject = () => {
    if (!adminComments.trim()) {
      alert('Please provide comments explaining the rejection');
      return;
    }
    onReject(timesheet.id, adminComments);
  };

  const days: Array<keyof DailyTotal> = ['mon', 'tue', 'wed', 'thu', 'fri','sat','sun'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat','Sun'];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Timesheet Approval</h2>
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
              <p className="text-sm text-gray-500">Employee:</p>
              <p className="text-sm font-medium text-gray-900">
                {timesheet.employeeName || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Week:</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(timesheet.weekStart)} - {formatDate(timesheet.weekEnd)}
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
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  {dayLabels.map((day) => (
                    <th key={day} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </th>
                  ))}
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
{entriesWithLeave
  .filter(entry => entry.name.trim().toLowerCase() !== 'sick leave')
  .map((entry, index) => {
    const rowTotal = days.reduce((sum, day) => sum + (entry[day] || 0), 0);
    return (
      <tr key={`${entry.type}-${entry.name}-${index}`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {entry.name}
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
              <h3 className="text-sm font-medium text-gray-900 mb-2">Employee Comments</h3>
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                {timesheet.comments}
              </p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="admin-comments" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Comments
            </label>
            <textarea
              id="admin-comments"
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={3}
              placeholder="Add any notes or comments about this approval decision"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="mr-3 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;