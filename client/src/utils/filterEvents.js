import { isSameDay, getTodayLocal, getDateOnlyLocal } from "./dateHelpers";

/**
 * Filter events by search query
 * @param {Array} events - Array of events
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered events
 */
export function search(events, searchQuery) {
  if (!searchQuery) return events;
  
  const query = searchQuery.toLowerCase();
  return events.filter(event => {
    const title = event.title?.toLowerCase() || '';
    const location = event.location?.toLowerCase() || '';
    return title.includes(query) || location.includes(query);
  });
}

/**
 * Parse location string to extract city
 * Format: "Град, Адрес" - градът е първата част
 * @param {string} location - Location string
 * @returns {string} City name
 */
function parseCity(location) {
  if (!location) return '';
  if (location.toLowerCase().includes('онлайн')) return '';
  const parts = location.split(',').map(p => p.trim());
  // Първата част е градът
  return parts.length >= 1 ? parts[0] : '';
}

/**
 * Filter events by city
 * @param {Array} events - Array of events
 * @param {string} city - City name (exact match)
 * @returns {Array} Filtered events
 */
export function filterCity(events, city) {
  if (!city) return events;
  return events.filter(event => {
    const eventCity = parseCity(event.location || '');
    return eventCity === city;
  });
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
    const price = event.price;
    if (typeof price === "number") {
      return price === 0;
    }
    return false;
  });
}

/**
 * Filter events by date
 * @param {Array} events - Array of events
 * @param {string} selectedDate - Selected date string (YYYY-MM-DD)
 * @returns {Array} Filtered events
 */
export function filterDate(events, selectedDate) {
  if (!selectedDate) return events;
  
  return events.filter(event => {
    if (!event.date) return false;
    return isSameDay(event.date, selectedDate);
  });
}

/**
 * Filter out past events
 * @param {Array} events - Array of events
 * @returns {Array} Filtered events (only future events)
 */
export function filterPastEvents(events) {
  const today = getTodayLocal();
  
  return events.filter(event => {
    if (!event.date) return false;
    
    try {
      const eventDate = getDateOnlyLocal(event.date);
      return eventDate >= today;
    } catch {
      return false;
    }
  });
}

/**
 * Apply all filters to events in the correct order
 * Pipeline: filter past events → search → city → category → price → date
 * @param {Array} events - Events array
 * @param {Object} filters - Filter object with all filter values
 * @returns {Array} Filtered events
 */
export function applyFilters(events, filters) {
  const {
    searchQuery = "",
    city = "",
    category = "",
    price = "",
    date = ""
  } = filters;
  
  // Step 1: Filter past events
  let filtered = filterPastEvents(events);
  
  // Step 2: Apply search filter
  filtered = search(filtered, searchQuery);
  
  // Step 3: Apply city filter
  filtered = filterCity(filtered, city);
  
  // Step 4: Apply category filter
  filtered = filterCategory(filtered, category);
  
  // Step 5: Apply price filter
  filtered = filterPrice(filtered, price);
  
  // Step 6: Apply date filter
  filtered = filterDate(filtered, date);
  
  return filtered;
}

