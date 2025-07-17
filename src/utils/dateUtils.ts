// Format date as Month D, YYYY
export const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Helper to get start of week (Monday)
  export const getStartOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  
  // Get end of week (Sunday)
  export const getEndOfWeek = (date: Date): Date => {
    const weekStart = getStartOfWeek(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  };
  
  
// Get Friday start of week
export const getFridayStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  // Friday is 5
  const diff = day >= 5 ? result.getDate() - (day - 5) : result.getDate() - (day + 2);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get Thursday end of week
export const getThursdayEndOfWeek = (date: Date): Date => {
  const fridayStart = getFridayStartOfWeek(date);
  const thursdayEnd = new Date(fridayStart);
  thursdayEnd.setDate(thursdayEnd.getDate() + 6);
  thursdayEnd.setHours(23, 59, 59, 999);
  return thursdayEnd;
};

  
// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date to local YYYY-MM-DD string to avoid timezone issues
export const formatDateToLocalString = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
