import { useMemo } from "react";

/**
 * Custom hook for formatting and processing event dates
 * @param {Object} event - The event object (normalized)
 * @param {boolean} isExternal - Whether the event is external
 * @returns {Object} Formatted dates and time information
 */
export function useEventDates(event, isExternal = false) {
  // Check if time is meaningful (not midnight)
  const hasTime = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      
      // Check if time is midnight in local timezone
      // Dates created from YYYY-MM-DD format (date-only) will have 00:00:00 in local time
      const localHours = date.getHours();
      const localMinutes = date.getMinutes();
      const localSeconds = date.getSeconds();
      const localMilliseconds = date.getMilliseconds();
      
      // If all time components are 0 in local time, treat it as date-only
      // This handles dates scraped from Varna site which only have date (DD.MM.YYYY)
      if (localHours === 0 && localMinutes === 0 && localSeconds === 0 && localMilliseconds === 0) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const formatDateTime = (dateString, isExternalEvent = false) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      
      // For external events, always show only date (no time)
      if (isExternalEvent) {
        return date.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
      
      // For local events, check if time is present
      if (hasTime(dateString)) {
        // Format with date and time
        return date.toLocaleString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } else {
        // Format only date (no time)
        return date.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
    } catch {
      return dateString;
    }
  };

  const startDateTime = useMemo(
    () => formatDateTime(event?.startDate, isExternal),
    [event?.startDate, isExternal]
  );

  const endDateTime = useMemo(
    () => (event?.endDate ? formatDateTime(event.endDate, isExternal) : null),
    [event?.endDate, isExternal]
  );

  return {
    startDateTime,
    endDateTime,
    hasTime
  };
}

