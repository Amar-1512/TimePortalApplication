// dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTimesheet } from '../../hooks/useTimesheet';
import { formatDate, getStartOfWeek } from '../../utils/dateUtils';
import TimesheetTable from './TimesheetTable';
import TimesheetHistory from './TimesheetHistory';
import TimesheetModal from './TimesheetModal';
import AddProjectModal from './AddProjectModal';
import Modal from '../Modal'; // Import the new Modal component
import ChangePasswordModal from '../auth/ChangePasswordModal'; // Import ChangePasswordModal
 
const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    currentTimesheet,
    currentWeekStart,
    setCurrentWeekStart,
    saveTimesheet,
    submitTimesheet,
    showAlert, // Get the new showAlert function from context
    modalMessage, // Get modal message state from context
    showModal, // Get modal visibility state from context
    closeModal, // Get modal close function from context
    hasPendingTimesheet,
    getPendingTimesheetCount,
  } = useTimesheet();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const navigate = useNavigate();
 
  // Define todayWeekStart once, outside of functions if it doesn't change on re-renders
  const todayWeekStart = getStartOfWeek(new Date());
 
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
 
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
 
    // Calculate the start of the week for the new date
    const newWeekStartDate = getStartOfWeek(newDate);
 
    // Prevent navigating to future weeks
    if (direction === 1 && newWeekStartDate.getTime() > todayWeekStart.getTime()) {
      return;
    }
 
    setCurrentWeekStart(newDate);
  };
 
  // Disable next week button if currentWeekStart is the same as or after todayWeekStart
  const isNextWeekDisabled = currentWeekStart.getTime() >= todayWeekStart.getTime();
 
  const handleSaveTimesheet = () => {
    console.log('handleSaveTimesheet called', { currentTimesheet, comments });
    if (!currentTimesheet) return;
 
    const updatedTimesheet = {
      ...currentTimesheet,
      comments,
    };
 
    saveTimesheet(updatedTimesheet);
    // The success alert for saving is now handled inside saveTimesheet in TimesheetContext
    // alert('Timesheet saved successfully!'); // REMOVED: Handled by context's showAlert
  };
 
  const handleSubmitTimesheet = () => {
    console.log('handleSubmitTimesheet called', { currentTimesheet, comments });
    if (!currentTimesheet) return;
 
    const updatedTimesheet = {
      ...currentTimesheet,
      comments,
    };
 
    submitTimesheet(updatedTimesheet);
    // The success alert for submitting is now handled inside submitTimesheet in TimesheetContext
    // alert('Timesheet submitted for approval!'); // REMOVED: Handled by context's showAlert
  };
 
  const viewTimesheet = (id: number) => {
    setSelectedTimesheetId(id);
    setShowTimesheetModal(true);
  };
 
  useEffect(() => {
    if (currentTimesheet) {
      setComments(currentTimesheet.comments);
    }
  }, [currentTimesheet]);
 
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
 
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Timesheet Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">
                Welcome, <span className="font-semibold">{currentUser?.displayName}</span>
              </span>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 mr-4"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-gray-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
 
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`${
                  activeTab === 'current'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('current')}
              >
                Current Timesheet
              </button>
              <button
                className={`${
                  activeTab === 'history'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('history')}
              >
                Previous Timesheets
              </button>
            </nav>
          </div>
 
          {activeTab === 'current' ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <button
                    onClick={() => navigateWeek(-1)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="mx-2 font-medium">
                    Week of {formatDate(currentWeekStart)} - {formatDate(weekEnd)}
                  </span>
                  <button
                    onClick={() => navigateWeek(1)}
                    disabled={isNextWeekDisabled}
                    className={`p-1 rounded-full hover:bg-gray-200 ${isNextWeekDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      currentTimesheet?.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : currentTimesheet?.status === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : currentTimesheet?.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {currentTimesheet?.status === 'not-submitted'
                      ? 'Not Submitted'
                      : currentTimesheet?.status
                      ? currentTimesheet.status.charAt(0).toUpperCase() + currentTimesheet.status.slice(1)
                      : ''}
                  </span>
                </div>
              </div>
 
              {currentTimesheet && (
                <>
                  <TimesheetTable
                    timesheet={currentTimesheet}
                    isEditable={currentTimesheet.status === 'not-submitted'}
                  />
 
                  <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3">
                      <button
                        onClick={() => setShowAddProjectModal(true)}
                        disabled={currentTimesheet.status !== 'not-submitted'}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                          currentTimesheet.status === 'not-submitted'
                            ? 'text-gray-700 bg-white hover:bg-gray-50'
                            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        }`}
                      >
                        Add Project
                      </button>
                    </div>
                    <div className="md:w-2/3">
                      <div className="mb-2">
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                          Comments:
                        </label>
                        <textarea
                          id="comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          disabled={currentTimesheet.status !== 'not-submitted'}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          rows={3}
                          placeholder="Add any notes or comments about this timesheet"
                        />
                      </div>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={handleSaveTimesheet}
                          disabled={currentTimesheet.status !== 'not-submitted'}
                          className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                            currentTimesheet.status === 'not-submitted'
                              ? 'text-gray-700 bg-white hover:bg-gray-50'
                              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          }`}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            // Keeping window.confirm for this specific action, but using showAlert for the success message
                            if (window.confirm('Are you sure you want to delete all entries for this week?')) {
                              if (!currentTimesheet) return;
                              const clearedEntries = currentTimesheet.entries.map(entry => ({
                                ...entry,
                                mon: 0,
                                tue: 0,
                                wed: 0,
                                thu: 0,
                                fri: 0,
                                sat: 0,
                                sun: 0,
                              }));
                              const clearedTimesheet = {
                                ...currentTimesheet,
                                entries: clearedEntries,
                              };
                              saveTimesheet(clearedTimesheet);
                              showAlert('All entries have been deleted for this week.'); // Using custom showAlert
                            }
                          }}
                          disabled={currentTimesheet.status !== 'not-submitted'}
                          className="px-4 py-2 border border-red-600 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          Clear Entries
                        </button>
                        <button
                          onClick={handleSubmitTimesheet}
                          disabled={currentTimesheet.status !== 'not-submitted'}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            currentTimesheet.status === 'not-submitted'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Submit for Approval
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <TimesheetHistory
              onViewTimesheet={viewTimesheet}
              initialStatusFilter={activeTab === 'history' ? 'not-submitted' : 'all'}
            />
          )}
        </div>
      </main>
 
      {showTimesheetModal && (
        <TimesheetModal
          timesheetId={selectedTimesheetId!}
          onClose={() => setShowTimesheetModal(false)}
        />
      )}
 
      {showAddProjectModal && (
        <AddProjectModal
          onClose={() => setShowAddProjectModal(false)}
        />
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
 
      {/* Render the custom Modal component */}
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
 
export default Dashboard;
 