import { getTodayUTC, getDateOnlyUTC, isSameDay } from "./dateHelpers";

/**
 * Filter events by search query
 * @param {Array} events - Array of events
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered events
 */
export function search(events, searchQuery) {
  if (!searchQuery) return events;
  
  const query = searchQuery.toLowerCase();
  return events.filter(event => 
    event.title?.toLowerCase().includes(query) ||
    event.location?.address?.toLowerCase().includes(query) ||
    event.location?.city?.toLowerCase().includes(query)
  );
}

/**
 * Filter events by city
 * @param {Array} events - Array of events
 * @param {string} city - City name (exact match)
 * @returns {Array} Filtered events
 */
export function filterCity(events, city) {
  if (!city) return events;
  return events.filter(event => event.location?.city === city);
}

/**
 * Filter events by category
 * @param {Array} events - Array of events
 * @param {string} category - Category name (exact match)
 * @returns {Array} Filtered events
 */
export function filterCategory(events, category) {
  if (!category) return events;
  return events.filter(event => event.category === category);
}

/**
 * Filter events by price
 * @param {Array} events - Array of events
 * @param {string} priceFilter - Price filter ("free" or empty)
 * @returns {Array} Filtered events
 */
export function filterPrice(events, priceFilter) {
  if (!priceFilter || priceFilter !== "free") return events;
  
  return events.filter(event => {
    // Handle both string and numeric prices
    if (typeof event.price === "number") {
      return event.price === 0;
    }
    const priceValue = event.price || "";
    const priceLower = String(priceValue).toLowerCase();
    return (
      priceValue === "Безплатно" ||
      priceLower.includes("безплат") ||
      priceLower.includes("free") ||
      priceValue === 0
    );
  });
}

/**
 * Filter events by date
 * @param {Array} events - Array of events
 * @param {string} selectedDate - Selected date string
 * @returns {Array} Filtered events
 */
export function filterDate(events, selectedDate) {
  if (!selectedDate) return events;
  
  return events.filter(event => {
    if (!event.startDate) return false;
    return isSameDay(event.startDate, selectedDate);
  });
}

/**
 * Filter out past events (where both startDate and endDate are in the past)
 * @param {Array} events - Array of events
 * @returns {Array} Filtered events (only future events)
 */
export function filterPastEvents(events) {
  return events.filter(event => {
    if (!event.startDate) {
      return false; // Skip events without start date
    }
    
    const todayUTC = getTodayUTC();
    const startDateUTC = getDateOnlyUTC(event.startDate);
    
    // If start date is in the past, check end date
    if (startDateUTC < todayUTC) {
      if (event.endDate) {
        const endDateUTC = getDateOnlyUTC(event.endDate);
        // If end date is also in the past, skip this event
        return endDateUTC >= todayUTC;
      }
      // No end date, but start date is past - skip
      return false;
    }
    
    // Event is valid (start date is in future)
    return true;
  });
}

/**
 * Combine events from different sources based on source filter
 * @param {Array} localEvents - Local events array
 * @param {Array} externalEvents - External events array
 * @param {string} sourceFilter - Source filter ("all", "local", "external")
 * @returns {Array} Combined events array
 */
export function combineSources(localEvents, externalEvents, sourceFilter) {
  if (sourceFilter === "local") {
    return localEvents;
  } else if (sourceFilter === "external") {
    return externalEvents;
  } else {
    // sourceFilter === "all"
    return [...localEvents, ...externalEvents];
  }
}

/**
 * Apply all filters to events in the correct order
 * Pipeline: combine sources → filter past events → search → city → category → price → date
 * @param {Array} localEvents - Local events array
 * @param {Array} externalEvents - External events array
 * @param {Object} filters - Filter object with all filter values
 * @returns {Array} Filtered events
 */
export function applyFilters(localEvents, externalEvents, filters) {
  const {
    sourceFilter = "all",
    searchQuery = "",
    city = "",
    category = "",
    price = "",
    date = ""
  } = filters;
  
  // Step 1: Combine sources
  let filtered = combineSources(localEvents, externalEvents, sourceFilter);
  
  // Step 2: Filter past events
  filtered = filterPastEvents(filtered);
  
  // Step 3: Apply search filter
  filtered = search(filtered, searchQuery);
  
  // Step 4: Apply city filter
  filtered = filterCity(filtered, city);
  
  // Step 5: Apply category filter
  filtered = filterCategory(filtered, category);
  
  // Step 6: Apply price filter
  filtered = filterPrice(filtered, price);
  
  // Step 7: Apply date filter
  filtered = filterDate(filtered, date);
  
  return filtered;
}

