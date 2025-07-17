export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

export interface TimeEntry {
  type: 'project' | 'leave' | 'holiday' | 'sick' | 'vacation';
  name: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
  comment?: string;
}

export interface Timesheet {
  id: number;
  weekStart: Date | null;
  weekEnd: Date | null;
  status: 'not-submitted' | 'submitted' | 'approved' | 'rejected';
  totalHours: number;
  submittedDate: Date | null;
  entries: TimeEntry[];
  comments: string;
  employeeId?: string;
  employeeName?: string;
  adminComments?: string;
}

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Days = Day[];

export interface DailyTotal {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}
