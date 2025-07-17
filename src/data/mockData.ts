import { Timesheet, User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'user1@adroit.com',
    displayName: 'Akanksha',
    role: 'user'
  },
  {
    id: 'user2',
    email: 'user2@adroit.com',
    displayName: 'Amaresh',
    role: 'user'
  },
  {
    id: 'user3',
    email: 'user3@adroit.com',
    displayName: 'Akhil',
    role: 'user'
  },
  {
    id: 'admin1',
    email: 'admin1@adroit.com',
    displayName: 'Admin User',
    role: 'admin'
  }
];

export const mockAdminUsers: User[] = [
  {
    id: 'admin2',
    email: 'admin2@adroit.com',
    displayName: 'System Admin',
    role: 'admin'
  }
];

export const mockTimesheets: Timesheet[] = [
  {
    id: 1,
    weekStart: new Date(2025, 3, 7), // April 7, 2025
    weekEnd: new Date(2025, 3, 13), // April 13, 2025
    status: 'approved',
    totalHours: 40,
    submittedDate: new Date(2025, 3, 12), // April 12, 2025
    entries: [
      { type: 'project', name: 'Project', mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
      { type: 'holiday', name: 'Holiday', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      { type: 'sick', name: 'Sick Leave', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
    ],
    comments: 'Regular work week',
    employeeId: 'user1',
    employeeName: 'Akanksha'
  },
  {
    id: 2,
    weekStart: new Date(2025, 2, 31), // March 31, 2025
    weekEnd: new Date(2025, 3, 6), // April 6, 2025
    status: 'submitted',
    totalHours: 38,
    submittedDate: new Date(2025, 3, 5), // April 5, 2025
    entries: [
      { type: 'project', name: 'Project', mon: 6, tue: 6, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
      { type: 'holiday', name: 'Holiday', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      { type: 'sick', name: 'Sick Leave', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
    ],
    comments: 'Took partial vacation on Tuesday',
    employeeId: 'user1',
    employeeName: 'Akanksha'
  },
  {
    id: 3,
    weekStart: new Date(2025, 2, 24), // March 24, 2025
    weekEnd: new Date(2025, 2, 30), // March 30, 2025
    status: 'approved',
    totalHours: 42,
    submittedDate: new Date(2025, 2, 29), // March 29, 2025
    entries: [
      { type: 'project', name: 'Project', mon: 6, tue: 8, wed: 8, thu: 8, fri: 6, sat: 0, sun: 0 },
      { type: 'holiday', name: 'Holiday', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      { type: 'sick', name: 'Sick Leave', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
    ],
    comments: 'Working remotely on Friday due to office maintenance. Additional hours on weekend for project deadline.',
    employeeId: 'user1',
    employeeName: 'Akanksha'
  }
];

export const availableProjects = [
  'Project A',
  'Project B',
  'Project C'
];