import React, { useState, useEffect } from 'react';
import { Timesheet } from '../../types';
import { useTimesheet } from '../../hooks/useTimesheet';
import { formatDate } from '../../utils/dateUtils';
import ApprovalModal from './ApprovalModal';

const PendingApprovals: React.FC = () => {
  const { timesheets, approveTimesheet, rejectTimesheet } = useTimesheet();
  const [pendingTimesheets, setPendingTimesheets] = useState<Timesheet[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);

  useEffect(() => {
    // Filter for submitted timesheets
    const submitted = timesheets.filter(ts => ts.status === 'submitted');
    setPendingTimesheets(submitted);
  }, [timesheets]);

  const handleViewTimesheet = (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowApprovalModal(true);
  };

  const handleApprove = (id: number, comments?: string) => {
    approveTimesheet(id, comments);
    // Update the local state
    setPendingTimesheets(prev => prev.filter(ts => ts.id !== id));
    setShowApprovalModal(false);
  };

  const handleReject = (id: number, comments: string) => {
    rejectTimesheet(id, comments);
    // Update the local state
    setPendingTimesheets(prev => prev.filter(ts => ts.id !== id));
    setShowApprovalModal(false);
  };

  const handleDirectApprove = (id: number) => {
    if (window.confirm('Are you sure you want to approve this timesheet?')) {
      approveTimesheet(id);
      // Update the local state
      setPendingTimesheets(prev => prev.filter(ts => ts.id !== id));
    }
  };

  const handleDirectReject = (id: number) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectTimesheet(id, reason);
      // Update the local state
      setPendingTimesheets(prev => prev.filter(ts => ts.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Pending Timesheet Approvals</h2>
      
      {pendingTimesheets.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No timesheets pending approval</p>
        </div>
      ) : (
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
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingTimesheets.map((timesheet) => (
                <tr key={timesheet.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {timesheet.employeeName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(timesheet.weekStart)} - {formatDate(timesheet.weekEnd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.totalHours.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timesheet.submittedDate ? formatDate(timesheet.submittedDate) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewTimesheet(timesheet)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDirectApprove(timesheet.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDirectReject(timesheet.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApprovalModal && selectedTimesheet && (
        <ApprovalModal
          timesheet={selectedTimesheet}
          onClose={() => setShowApprovalModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default PendingApprovals;