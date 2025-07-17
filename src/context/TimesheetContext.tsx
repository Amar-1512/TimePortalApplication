import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Timesheet, TimeEntry, DailyTotal } from '../types';
import { getStartOfWeek, getEndOfWeek, formatDateToLocalString } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

interface TimesheetContextType {
  timesheets: Timesheet[];
  currentTimesheet: Timesheet | null;
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;
  saveTimesheet: (timesheet: Timesheet) => Promise<void>;
  submitTimesheet: (timesheet: Timesheet) => void;
  approveTimesheet: (id: number, comments?: string) => void;
  rejectTimesheet: (id: number, comments: string) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (index: number, entry: TimeEntry) => void;
  calculateDailyTotals: (entries: TimeEntry[]) => DailyTotal;
  calculateWeeklyTotal: (dailyTotals: DailyTotal) => number;
  showAlert: (message: string) => void;
  modalMessage: string;
  showModal: boolean;
  closeModal: () => void;
  hasPendingTimesheet: () => boolean;
  getPendingTimesheetCount: () => number;
}

export const TimesheetContext = createContext<TimesheetContextType>({
  timesheets: [],
  currentTimesheet: null,
  currentWeekStart: new Date(),
  setCurrentWeekStart: () => {},
  saveTimesheet: async () => {},
  submitTimesheet: () => {},
  approveTimesheet: () => {},
  rejectTimesheet: () => {},
  addTimeEntry: () => {},
  updateTimeEntry: () => {},
  calculateDailyTotals: () => ({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }),
  calculateWeeklyTotal: () => 0,
  showAlert: () => {},
  modalMessage: '',
  showModal: false,
  closeModal: () => {},
  hasPendingTimesheet: () => false,
  getPendingTimesheetCount: () => 0,
});

interface TimesheetProviderProps {
  children: ReactNode;
}

export const TimesheetProvider: React.FC<TimesheetProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [allTimesheets, setAllTimesheets] = useState<Timesheet[]>([]);
  const [currentWeekStartInternal, setCurrentWeekStartInternal] = useState<Date>(getStartOfWeek(new Date()));
  const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const showAlert = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalMessage('');
    setShowModal(false);
  };

  const timesheets = allTimesheets;

const fetchTimesheets = async () => {
    if (!currentUser) return; // Ensure currentUser exists before fetching

    try {
      // MODIFICATION START: Fetch all timesheets if admin, else filter by employeeName
      const url = currentUser.role === 'admin'
        ? 'http://localhost:8080/api/timesheet-entries'
        : `http://localhost:8080/api/timesheet-entries?employeeName=${encodeURIComponent(currentUser.displayName)}`;
      const response = await fetch(url);
      // MODIFICATION END

      if (!response.ok) {
        throw new Error('Failed to fetch timesheets');
      }
      const data: Timesheet[] = await response.json();

      // Convert date strings to Date objects
      const convertedData = data.map(ts => {
        // Transform backend daily fields into entries array expected by frontend
        const entries = [
          { type: 'project' as const, name: 'Project', mon: ts.mon || 0, tue: ts.tue || 0, wed: ts.wed || 0, thu: ts.thu || 0, fri: ts.fri || 0, sat: ts.sat || 0, sun: ts.sun || 0 },
          { type: 'holiday' as const, name: 'Holiday', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
          { type: 'sick' as const, name: 'Sick Leave', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        ];
        return {
          ...ts,
          weekStart: ts.weekStart ? new Date(ts.weekStart) : null,
          weekEnd: ts.weekEnd ? new Date(ts.weekEnd) : null,
          submittedDate: ts.submittedDate ? new Date(ts.submittedDate) : null,
          entries: entries,
        };
      });

      setAllTimesheets(convertedData);
    } catch (error) {
      if (error instanceof Error) {
        showAlert(`Error fetching timesheets: ${error.message}`);
      } else {
        showAlert('Error fetching timesheets: Unknown error');
      }
    }
  };

  useEffect(() => {
    // Fetch timesheets whenever the currentUser changes (login/logout)
    fetchTimesheets();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadCurrentTimesheet();
    }
  }, [currentWeekStartInternal, currentUser, allTimesheets]);

  const setCurrentWeekStart = (newDate: Date) => {
    if (!currentUser) {
      showAlert('Error: User not logged in.');
      return;
    }
    const newWeekStartDate = getStartOfWeek(newDate);
    setCurrentWeekStartInternal(newWeekStartDate);
  };

  const loadCurrentTimesheet = () => {
    if (!currentUser) return;

    // MODIFICATION START: Filter by currentUser.id when finding the current timesheet
    const found = timesheets.find(
      ts => ts.weekStart !== null && ts.weekStart !== null && getStartOfWeek(new Date(ts.weekStart)).getTime() === currentWeekStartInternal.getTime() && ts.employeeName === currentUser.displayName
    );
    // MODIFICATION END

    if (found) {
      setCurrentTimesheet(found);
    } else {
      const weekEnd = getEndOfWeek(currentWeekStartInternal);
      const newTimesheet: Timesheet = {
        id: 0,
        weekStart: currentWeekStartInternal,
        weekEnd: weekEnd,
        status: 'not-submitted',
        totalHours: 0,
        submittedDate: null,
        entries: [
          { type: 'project', name: 'Project', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
          { type: 'holiday', name: 'Holiday', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
          { type: 'sick', name: 'Sick Leave', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
        ],
        comments: '',
        employeeId: currentUser.id, // Ensure new timesheets are associated with the current user
        employeeName: currentUser.displayName
      };
      setCurrentTimesheet(newTimesheet);
    }
  };

  const calculateDailyTotals = (entries: TimeEntry[]): DailyTotal => {
    const totals: DailyTotal = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
    entries.forEach(e => {
      totals.mon += e.mon || 0;
      totals.tue += e.tue || 0;
      totals.wed += e.wed || 0;
      totals.thu += e.thu || 0;
      totals.fri += e.fri || 0;
      totals.sat += e.sat || 0;
      totals.sun += e.sun || 0;
    });
    return totals;
  };

  const calculateWeeklyTotal = (daily: DailyTotal): number =>
    Object.values(daily).reduce((sum, v) => sum + v, 0);

  const saveTimesheet = async (timesheetToSave: Timesheet) => {
    if (!currentUser) {
      showAlert('Error: User not logged in.');
      return;
    }

    const dailyTotals = calculateDailyTotals(timesheetToSave.entries);
    const totalHours = calculateWeeklyTotal(dailyTotals);

    const formatDateToString = (date: Date | null | undefined): string | null => {
      if (!date) return null;
      return formatDateToLocalString(date);
    };

    const payload = {
      id: timesheetToSave.id,
      employeeName: timesheetToSave.employeeName,
      weekStart: formatDateToString(timesheetToSave.weekStart),
      weekEnd: formatDateToString(timesheetToSave.weekEnd),
      status: timesheetToSave.status,
      totalHours: totalHours,
      submittedDate: formatDateToString(timesheetToSave.submittedDate),
      mon: dailyTotals.mon,
      tue: dailyTotals.tue,
      wed: dailyTotals.wed,
      thu: dailyTotals.thu,
      fri: dailyTotals.fri,
      sat: dailyTotals.sat,
      sun: dailyTotals.sun,
      comments: timesheetToSave.comments,
      employeeId: currentUser.id, // Ensure employeeId is sent with the payload for consistency
    };

    try {
      const url = timesheetToSave.id > 0
        ? `http://localhost:8080/api/timesheet-entries/${timesheetToSave.id}`
        : 'http://localhost:8080/api/timesheet-entries';
      const method = timesheetToSave.id > 0 ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('You already entered the data for this week')) {
          showAlert('You already entered the data for this week');
        } else {
          throw new Error(errorText || 'Failed to save timesheet');
        }
        return;
      }

      const savedData = await response.json();

      const updatedTimesheet: Timesheet = {
        ...timesheetToSave,
        id: savedData.id,
        status: savedData.status,
      };

      setAllTimesheets(prev => {
        const existingIndex = prev.findIndex(ts => ts.id === updatedTimesheet.id);
        if (existingIndex > -1) {
          const newTimesheets = [...prev];
          newTimesheets[existingIndex] = updatedTimesheet;
          return newTimesheets;
        }
        // MODIFICATION START: When adding a new timesheet, ensure we match by employeeId as well
        const newTimesheetIndex = prev.findIndex(ts => ts.id === 0 && new Date(ts.weekStart).getTime() === new Date(updatedTimesheet.weekStart).getTime() && ts.employeeName === currentUser.displayName);
        // MODIFICATION END
        if (newTimesheetIndex > -1) {
          const newTimesheets = [...prev];
          newTimesheets[newTimesheetIndex] = updatedTimesheet;
          return newTimesheets;
        }
        return [...prev, updatedTimesheet];
      });

      setCurrentTimesheet(updatedTimesheet);

      if (timesheetToSave.status !== 'submitted') {
        // showAlert('Timesheet saved successfully!');
      }

    } catch (error) {
      if (error instanceof Error) {
        showAlert(`Error saving timesheet: ${error.message}`);
      } else {
        showAlert('Error saving timesheet: Unknown error');
      }
      loadCurrentTimesheet(); // Attempt to reload the current timesheet on error
    }
  };

  const submitTimesheet = async (timesheet: Timesheet) => {
    if (!currentUser) {
      showAlert('Error: User not logged in.');
      return;
    }
    if (guardPending()) {
      return;
    }
    const updated = {
      ...timesheet,
      status: 'submitted' as const,
      submittedDate: new Date()
    };
    await saveTimesheet(updated);
    showAlert('Timesheet submitted');
  };

  const guardPending = (): boolean => {
    if (!currentUser) return false;

    // MODIFICATION START: Filter pending timesheets by currentUser.id
    const pendingTimesheets = timesheets.filter(ts =>
      ts.weekStart !== null &&
      ts.weekStart !== null &&
      ts.status === 'not-submitted' &&
      getStartOfWeek(new Date(ts.weekStart)).getTime() !== currentWeekStartInternal.getTime() &&
      ts.employeeName === currentUser.displayName
    );
    // MODIFICATION END

    if (pendingTimesheets.length > 0) {
      showAlert(`You have ${pendingTimesheets.length} pending timesheet${pendingTimesheets.length > 1 ? 's' : ''}.`);
      return true;
    }

    return false;
  };

  const hasPendingTimesheet = (): boolean => {
    if (!currentUser) return false;
    // MODIFICATION START: Filter pending timesheets by currentUser.id
    const pendingTimesheets = timesheets.filter(ts =>
      ts.weekStart !== null &&
      ts.status === 'not-submitted' &&
      getStartOfWeek(new Date(ts.weekStart)).getTime() !== currentWeekStartInternal.getTime() &&
      ts.employeeId === currentUser.id
    );
    // MODIFICATION END
    return pendingTimesheets.length > 0;
  };

  const getPendingTimesheetCount = (): number => {
    if (!currentUser) return 0;
    // MODIFICATION START: Filter pending timesheets by currentUser.id
    const pendingTimesheets = timesheets.filter(ts =>
      ts.weekStart !== null &&
      ts.status === 'not-submitted' &&
      getStartOfWeek(new Date(ts.weekStart)).getTime() !== currentWeekStartInternal.getTime() &&
      ts.employeeId === currentUser.id
    );
    // MODIFICATION END
    return pendingTimesheets.length;
  };

  const addTimeEntry = (entry: TimeEntry) => {
    if (guardPending() || !currentTimesheet) return;

    const updatedTimesheet = {
      ...currentTimesheet,
      entries: [...currentTimesheet.entries, entry]
    };
    setCurrentTimesheet(updatedTimesheet);
  };

  const updateTimeEntry = (index: number, entry: TimeEntry) => {
    if (guardPending() || !currentTimesheet) return;

    const updatedEntries = [...currentTimesheet.entries];
    updatedEntries[index] = entry;
    const updatedTimesheet = { ...currentTimesheet, entries: updatedEntries };
    setCurrentTimesheet(updatedTimesheet);
  };

  const updateTimesheetStatus = async (id: number, newStatus: 'approved' | 'rejected', comments: string = '') => {
    if (!currentUser || currentUser.role !== 'admin') {
      showAlert('Error: Only administrators can approve or reject timesheets.');
      return;
    }

    try {
      const url = `http://localhost:8080/api/timesheet-entries/${id}/status`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comments }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to ${newStatus} timesheet`);
      }

      const updatedData = await response.json();

      setAllTimesheets(prev =>
        prev.map(ts =>
          ts.id === id
            ? { ...ts, status: updatedData.status, comments: updatedData.comments }
            : ts
        )
      );

      if (currentTimesheet && currentTimesheet.id === id) {
        setCurrentTimesheet(prev => ({
          ...(prev as Timesheet),
          status: updatedData.status,
          comments: updatedData.comments,
        }));
      }

      showAlert(`Timesheet ${newStatus} !`);

      // Refresh timesheets list after status update to ensure correct data is displayed
      await fetchTimesheets();
    } catch (error) {
      if (error instanceof Error) {
        showAlert(`Error ${newStatus} timesheet: ${error.message}`);
      } else {
        showAlert(`Error ${newStatus} timesheet: Unknown error`);
      }
    }
  };

  const approveTimesheet = (id: number, comments?: string) => {
    updateTimesheetStatus(id, 'approved', comments);
  };

  const rejectTimesheet = (id: number, comments: string) => {
    if (!comments.trim()) {
      showAlert('Rejection requires comments.');
      return;
    }
    updateTimesheetStatus(id, 'rejected', comments);
  };

  return (
    <TimesheetContext.Provider
      value={{
        timesheets,
        currentTimesheet,
        currentWeekStart: currentWeekStartInternal,
        setCurrentWeekStart,
        saveTimesheet,
        submitTimesheet,
        approveTimesheet,
        rejectTimesheet,
        addTimeEntry,
        updateTimeEntry,
        calculateDailyTotals,
        calculateWeeklyTotal,
        showAlert,
        modalMessage,
        showModal,
        closeModal,
        hasPendingTimesheet,
        getPendingTimesheetCount,
      }}
    >
      {children}
    </TimesheetContext.Provider>
  );
};