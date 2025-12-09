import { API_BASE_URL } from "@/config/api";
import { normalizeEvent } from "@/utils/eventHelpers";

/**
 * Get all events (local + external) from the server
 * This uses the cached external events, not direct scraping
 * 
 * @returns {Promise<Object>} Object with localEvents and externalEvents arrays
 */
export async function getAllEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/all-events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to load all events: ${res.status} ${res.statusText} - ${err}`);
    }

    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to load events");
    }

    // Normalize all events
    const localEvents = (data.localEvents || []).map(event => normalizeEvent(event));
    const externalEvents = (data.externalEvents || []).map(event => normalizeEvent(event));
    
    return {
      localEvents,
      externalEvents,
      counts: data.counts || {
        local: localEvents.length,
        external: externalEvents.length,
        total: localEvents.length + externalEvents.length,
      },
    };
  } catch (error) {
    console.error("Error fetching all events:", error);
    throw error;
  }
}

/**
 * Get only external events from cache
 * @returns {Promise<Array>} Array of external events
 */
export async function getExternalEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/external-events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to load external events: ${res.status} ${res.statusText} - ${err}`);
    }

    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to load external events");
    }

    const events = (data.events || []).map(event => normalizeEvent(event));
    console.log(`Loaded ${events.length} external events from cache`);
    
    return events;
  } catch (error) {
    console.error("Error fetching external events:", error);
    throw error;
  }
}

/**
 * Force refresh external events cache (admin function)
 * @returns {Promise<Array>} Array of refreshed external events
 */
export async function refreshExternalEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/refresh-external`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to refresh external events: ${res.status} ${res.statusText} - ${err}`);
    }

    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to refresh external events");
    }

    const events = (data.events || []).map(event => normalizeEvent(event));
    console.log(`Refreshed ${events.length} external events`);
    
    return events;
  } catch (error) {
    console.error("Error refreshing external events:", error);
    throw error;
  }
}

// Legacy function name for backward compatibility
export async function fetchExternalEvents() {
  return getExternalEvents();
}

