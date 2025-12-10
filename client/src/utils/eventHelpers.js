/**
 * Sort events by a field
 * @param {Array} eventsList - Array of events to sort
 * @param {string} sortByField - Field to sort by (date, title, location)
 * @param {string} sortOrderValue - Sort order ("asc" or "desc")
 * @returns {Array} Sorted array of events
 */
export function sortEvents(eventsList, sortByField, sortOrderValue) {
  const sorted = [...eventsList].sort((a, b) => {
    let aValue = a[sortByField];
    let bValue = b[sortByField];

    // Handle different data types
    if (sortByField === "date") {
      // Compare dates
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    } else if (sortByField === "location") {
      // For location, compare as string
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
    } else {
      // Compare strings (title, etc.)
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrderValue === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrderValue === "asc" ? 1 : -1;
    }
    return 0;
  });

  return sorted;
}

