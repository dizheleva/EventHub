import { getExternalEvents } from "./externalEventsApi";

/**
 * Fetch events scraped from visit.varna.bg
 * Now uses cached external events from server (includes Varna events)
 * 
 * @returns {Promise<Array>} Array of normalized event objects with isExternal: true
 * @deprecated Use getExternalEvents() from externalEventsApi instead
 */
export async function fetchVarnaScrapedEvents() {
  // This now just returns cached external events (which include Varna events)
  // The actual scraping happens on the server side
  return getExternalEvents();
}

