import React, { useEffect, useState } from 'react';
import { TimeEntry, Timesheet, DailyTotal } from '../../types';
import { useTimesheet } from '../../hooks/useTimesheet';

interface TimesheetTableProps {
  timesheet: Timesheet;
  isEditable: boolean;
}

const TimesheetTable: React.FC<TimesheetTableProps> = ({ timesheet, isEditable }) => {
  const { calculateDailyTotals, calculateWeeklyTotal, updateTimeEntry } = useTimesheet();
  const [dailyTotals, setDailyTotals] = useState<DailyTotal>({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [key in keyof DailyTotal]?: 'project' | 'leave' | 'holiday' | 'sick' | 'vacation' | undefined }>({});

  const days: Array<keyof DailyTotal> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ✅ SAFEGUARD: Prevent rendering if timesheet or entries are missing
  if (!timesheet || !Array.isArray(timesheet.entries)) {
    return <div className="text-red-600 font-semibold p-4">Loading timesheet data...</div>;
  }

  useEffect(() => {
    const totals = calculateDailyTotals(timesheet.entries);
    setDailyTotals(totals);
    setWeeklyTotal(calculateWeeklyTotal(totals));

    const initialSelected: { [key in keyof DailyTotal]?: 'project' | 'leave' | 'holiday' | 'sick' | 'vacation' | undefined } = {};
    timesheet.entries.forEach((entry) => {
      days.forEach((day) => {
        if (entry[day] && entry[day] > 0) {
          initialSelected[day] = entry.type;
        }
      });
    });
    setSelectedOptions(initialSelected);
  }, [timesheet, calculateDailyTotals, calculateWeeklyTotal]);

  const handleHoursChange = (entryIndex: number, day: keyof DailyTotal, value: string) => {
    if (!isEditable) return;

    const hours = parseFloat(value) || 0;
    const updatedEntry = { ...timesheet.entries[entryIndex], [day]: hours };
    updateTimeEntry(entryIndex, updatedEntry);

    setSelectedOptions((prev) => ({
      ...prev,
      [day]: hours > 0 ? timesheet.entries[entryIndex].type : prev[day] === timesheet.entries[entryIndex].type ? undefined : prev[day],
    }));
  };

  const handleHolidayCheckboxChange = (entryIndex: number, day: keyof DailyTotal, checked: boolean) => {
    if (!isEditable) return;

    const hours = checked ? 8 : 0;
    const updatedEntry = { ...timesheet.entries[entryIndex], [day]: hours };
    updateTimeEntry(entryIndex, updatedEntry);

    setSelectedOptions((prev) => ({
      ...prev,
      [day]: hours > 0 ? 'holiday' : prev[day] === 'holiday' ? undefined : prev[day],
    }));
  };

  const handleLeaveChange = (entryIndex: number, day: keyof DailyTotal, value: string) => {
    if (!isEditable) return;

    const hours = value === 'fullday' ? 8 : value === 'halfday' ? 4 : 0;
    const updatedEntry = { ...timesheet.entries[entryIndex], [day]: hours };
    updateTimeEntry(entryIndex, updatedEntry);

    setSelectedOptions((prev) => ({
      ...prev,
      [day]: hours > 0 ? 'leave' : prev[day] === 'leave' ? undefined : prev[day],
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-500">
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
        <tbody className="bg-white divide-y divide-gray-500">
          {timesheet.entries.map((entry, entryIndex) => {
            const rowTotal = days.reduce((sum, day) => sum + (entry[day] || 0), 0);

            return (
              <tr key={`${entry.type}-${entry.name}-${entryIndex}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.type === 'sick' ? 'Leave' : entry.name}
                </td>
                {days.map((day) => {
                  const projectEntry = timesheet.entries.find((e) => e.type === 'project');
                  const projectHours = projectEntry ? (projectEntry[day] || 0) : 0;
                  const holidayEntry = timesheet.entries.find((e) => e.type === 'holiday');
                  const isHolidaySelected = holidayEntry ? (holidayEntry[day] || 0) > 0 : false;
                  const isOtherOptionSelected = selectedOptions[day] && selectedOptions[day] !== entry.type && selectedOptions[day] !== 'holiday';

                  let isDisabled = false;
                  if (entry.type === 'holiday') {
                    // Disable holiday if full day leave is selected for this day
                    const leaveEntry = timesheet.entries.find((e) => e.type === 'leave' || e.type === 'sick');
                    const isFullDayLeaveSelected = leaveEntry ? leaveEntry[day] === 8 : false;
                    isDisabled = !isEditable || isOtherOptionSelected || isFullDayLeaveSelected;
                  } else if (entry.type === 'leave' || entry.type === 'sick') {
                    // Disable leave if holiday is selected for this day
                    const holidayEntry = timesheet.entries.find((e) => e.type === 'holiday');
                    const isHolidaySelectedForDay = holidayEntry ? holidayEntry[day] === 8 : false;
                    isDisabled = !isEditable || isHolidaySelectedForDay;
                  } else if (entry.type === 'project') {
                    // Disable project if full day leave is selected for this day
                    const leaveEntry = timesheet.entries.find((e) => e.type === 'leave' || e.type === 'sick');
                    const isFullDayLeaveSelected = leaveEntry ? leaveEntry[day] === 8 : false;
                    isDisabled = !isEditable || isHolidaySelected || isFullDayLeaveSelected;
                  } else {
                    isDisabled = !isEditable || isHolidaySelected;
                  }

                  if (entry.type === 'leave' || entry.type === 'sick') {
                    return (
                      <td key={`leave-${entryIndex}-${day}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={entry[day] === 8 ? 'fullday' : entry[day] === 4 ? 'halfday' : ''}
                          onChange={(e) => handleLeaveChange(entryIndex, day, e.target.value)}
                          disabled={isDisabled}
                          className={`w-24 px-2 py-1 border ${isEditable && !isDisabled ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-md`}
                        >
                          <option value="">None</option>
                          <option value="fullday">Full Day</option>
                          <option value="halfday">Half Day</option>
                        </select>
                      </td>
                    );
                  } else if (entry.type === 'holiday') {
                    return (
                      <td key={`holiday-${entryIndex}-${day}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="checkbox"
                          checked={entry[day] === 8}
                          onChange={(e) => handleHolidayCheckboxChange(entryIndex, day, e.target.checked)}
                          disabled={isDisabled}
                          className="w-6 h-6"
                        />
                      </td>
                    );
                  } else {
                    return (
                      <td key={`project-${entryIndex}-${day}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={entry[day] || 0}
                          onChange={(e) => handleHoursChange(entryIndex, day, e.target.value)}
                          disabled={isDisabled}
                          className={`w-16 px-2 py-1 border ${isEditable && !isDisabled ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-md`}
                        />
                      </td>
                    );
                  }
                })}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rowTotal.toFixed(1)}
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Daily Total</td>
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
  );
};

export default TimesheetTable;
