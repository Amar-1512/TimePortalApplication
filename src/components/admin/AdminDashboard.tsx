import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, Users, FileText, CheckSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PendingApprovals from './PendingApprovals';
import AllTimesheets from './AllTimesheets';
import UserManagement from './UserManagement';
import ExportTimesheets from './ExportTimesheets';

const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users' | 'export'>('pending');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Admin: <span className="font-semibold">{currentUser?.displayName}</span></span>
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
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-red-700 hover:border-red-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('pending')}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Pending Approvals
              </button>
              <button
                className={`${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-red-700 hover:border-red-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('all')}
              >
                <FileText className="h-4 w-4 mr-2" />
                All Timesheets
              </button>
              <button
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-red-700 hover:border-red-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                User Management
              </button>
              <button
                className={`${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-red-700 hover:border-red-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                onClick={() => setActiveTab('export')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Timesheets
              </button>
            </nav>
          </div>

          {activeTab === 'pending' && <PendingApprovals />}
          {activeTab === 'all' && <AllTimesheets />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'export' && <ExportTimesheets />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;