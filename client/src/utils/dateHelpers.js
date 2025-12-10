/**
 * Date utility functions for event handling
 */

/**
 * Get today's date at midnight in local time
 * @returns {Date} Today's date at midnight
 */
export function getTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = getTodayLocal();
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

