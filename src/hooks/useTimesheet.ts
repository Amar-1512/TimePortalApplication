// hooks/useTimesheet.tsx
import { useContext } from 'react';
import { TimesheetContext } from '../context/TimesheetContext';

export const useTimesheet = () => {
  const context = useContext(TimesheetContext);

  if (!context) {
    throw new Error('useTimesheet must be used within a TimesheetProvider');
  }

  return context;
};