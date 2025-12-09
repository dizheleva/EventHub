/**
 * Date utility functions for event handling
 */

/**
 * Get today's date at midnight in UTC
 * @returns {Date} Today's date at midnight UTC
 */
export function getTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Get date at midnight in UTC (removes time component)
 * @param {Date|string} date - Date to normalize
 * @returns {Date} Date at midnight UTC
 */
export function getDateOnlyUTC(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
}

/**
 * Get date at midnight in local time (removes time component)
 * @param {Date|string} date - Date to normalize
 * @returns {Date} Date at midnight local time
 */
export function getDateOnlyLocal(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

/**
 * Check if an event is in the past
 * An event is considered past if both startDate and endDate are in the past
 * @param {Object} event - Event object with startDate and optional endDate
 * @returns {boolean} True if event is in the past
 */
export function isEventPast(event) {
  if (!event.startDate) {
    return false; // Can't determine if past without start date
  }

  try {
    const todayUTC = getTodayUTC();
    const startDateUTC = getDateOnlyUTC(event.startDate);

    // If start date is in the past, check end date
    if (startDateUTC < todayUTC) {
      if (event.endDate) {
        const endDateUTC = getDateOnlyUTC(event.endDate);
        // Event is past only if end date is also in the past
        return endDateUTC < todayUTC;
      } else {
        // No end date, but start date is past - event is past
        return true;
      }
    }

    // Start date is in the future - event is not past
    return false;
  } catch (error) {
    // If date parsing fails, assume event is not past
    return false;
  }
}

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = getDateOnlyLocal(new Date());
    const checkDate = getDateOnlyLocal(dateObj);
    return today.getTime() === checkDate.getTime();
  } catch {
    return false;
  }
}

/**
 * Check if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export function isSameDay(date1, date2) {
  try {
    const d1 = getDateOnlyLocal(date1);
    const d2 = getDateOnlyLocal(date2);
    return d1.getTime() === d2.getTime();
  } catch {
    return false;
  }
}

