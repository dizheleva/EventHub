const fs = require("fs").promises;
const path = require("path");
const { scrapeVarnaEvents } = require("./scraper");
const { fetchExternalEvents } = require("./externalScraper");

const CACHE_FILE = path.join(__dirname, "externalEventsStore.json");
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached external events
 * @returns {Promise<Array>} Array of cached events or empty array if no cache
 */
async function getCachedEvents() {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const cache = JSON.parse(data);
    
    // Validate cache structure
    if (!cache.events || !Array.isArray(cache.events)) {
      console.warn("Invalid cache structure, returning empty array");
      return [];
    }
    
    console.log(`Loaded ${cache.events.length} cached external events`);
    return cache.events;
  } catch (error) {
    if (error.code === "ENOENT") {
      // Cache file doesn't exist yet
      console.log("No cache file found, will create on first scrape");
      return [];
    }
    console.error("Error reading cache file:", error);
    return [];
  }
}

/**
 * Save events to cache
 * @param {Array} events - Array of events to cache
 * @returns {Promise<void>}
 */
async function saveEventsToCache(events) {
  try {
    const cache = {
      events: events || [],
      lastUpdated: new Date().toISOString(),
      count: events ? events.length : 0,
    };
    
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
    console.log(`Saved ${events.length} events to cache at ${cache.lastUpdated}`);
  } catch (error) {
    console.error("Error saving cache file:", error);
    throw error;
  }
}

/**
 * Check if cache should be refreshed
 * @returns {Promise<boolean>} True if cache is older than 24 hours or doesn't exist
 */
async function shouldRefreshCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const cache = JSON.parse(data);
    
    if (!cache.lastUpdated) {
      console.log("Cache has no timestamp, should refresh");
      return true;
    }
    
    const lastUpdated = new Date(cache.lastUpdated);
    const now = new Date();
    const ageMs = now - lastUpdated;
    
    const shouldRefresh = ageMs > CACHE_DURATION_MS;
    
    if (shouldRefresh) {
      const ageHours = Math.floor(ageMs / (60 * 60 * 1000));
      console.log(`Cache is ${ageHours} hours old, should refresh`);
    } else {
      const remainingHours = Math.floor((CACHE_DURATION_MS - ageMs) / (60 * 60 * 1000));
      console.log(`Cache is fresh, ${remainingHours} hours remaining`);
    }
    
    return shouldRefresh;
  } catch (error) {
    if (error.code === "ENOENT") {
      // Cache file doesn't exist
      console.log("Cache file doesn't exist, should refresh");
      return true;
    }
    console.error("Error checking cache age:", error);
    // On error, refresh to be safe
    return true;
  }
}

/**
 * Fetch and cache external events from all sources
 * @returns {Promise<Array>} Array of external events
 */
async function fetchAndCacheExternalEvents() {
  console.log("=== Starting external events fetch and cache ===");
  
  try {
    let allExternalEvents = [];
    
    // Fetch from Varna scraper
    try {
      console.log("Fetching events from Varna scraper...");
      const varnaEvents = await scrapeVarnaEvents();
      console.log(`Loaded ${varnaEvents.length} events from Varna scraper`);
      allExternalEvents = [...allExternalEvents, ...varnaEvents];
    } catch (error) {
      console.error("Error fetching Varna events:", error);
      // Continue with other sources even if one fails
    }
    
    // Fetch from AllEvents API (if configured)
    try {
      console.log("Fetching events from AllEvents API...");
      const alleventsEvents = await fetchExternalEvents();
      console.log(`Loaded ${alleventsEvents.length} events from AllEvents API`);
      allExternalEvents = [...allExternalEvents, ...alleventsEvents];
    } catch (error) {
      console.error("Error fetching AllEvents events:", error);
      // Continue even if AllEvents fails
    }
    
    // Deduplicate events (same title and startDate)
    const uniqueEvents = allExternalEvents.filter((event, index, self) =>
      index === self.findIndex(e =>
        e.title === event.title &&
        e.startDate === event.startDate
      )
    );
    
    console.log(`Total unique external events: ${uniqueEvents.length} (from ${allExternalEvents.length} combined)`);
    
    // Final filter: Remove past events where both startDate and endDate are in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    const futureEvents = uniqueEvents.filter(event => {
      if (!event.startDate) {
        console.log(`Skipping event "${event.title}" - no start date`);
        return false;
      }
      
      try {
        const startDate = new Date(event.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Check if start date is in the past
        if (startDate < now) {
          // If start date is past, check end date
          if (event.endDate) {
            const endDate = new Date(event.endDate);
            endDate.setHours(0, 0, 0, 0);
            
            // If end date is also in the past, skip this event
            if (endDate < now) {
              console.log(`Skipping past event "${event.title}" - start: ${event.startDate}, end: ${event.endDate}`);
              return false;
            }
          } else {
            // No end date, but start date is past - skip
            console.log(`Skipping past event "${event.title}" - start: ${event.startDate} (no end date)`);
            return false;
          }
        }
        
        // Event is valid (either start date is in future, or end date is in future)
        return true;
      } catch (error) {
        console.log(`Skipping event "${event.title}" - date parsing error:`, error);
        return false;
      }
    });
    
    console.log(`Filtered to ${futureEvents.length} future events (from ${uniqueEvents.length} unique events)`);
    
    // Save to cache
    await saveEventsToCache(futureEvents);
    
    console.log("=== External events fetch and cache completed ===");
    return futureEvents;
  } catch (error) {
    console.error("Error in fetchAndCacheExternalEvents:", error);
    throw error;
  }
}

/**
 * Refresh cache if needed
 * @returns {Promise<Array>} Array of cached events (refreshed or existing)
 */
async function refreshIfNeeded() {
  try {
    const needsRefresh = await shouldRefreshCache();
    
    if (needsRefresh) {
      console.log("Cache needs refresh, fetching new events...");
      return await fetchAndCacheExternalEvents();
    } else {
      console.log("Cache is fresh, using cached events");
      return await getCachedEvents();
    }
  } catch (error) {
    console.error("Error in refreshIfNeeded:", error);
    // On error, try to return cached events as fallback
    return await getCachedEvents();
  }
}

/**
 * Force refresh cache (ignore age check)
 * @returns {Promise<Array>} Array of refreshed events
 */
async function forceRefreshCache() {
  console.log("Force refreshing cache...");
  return await fetchAndCacheExternalEvents();
}

module.exports = {
  getCachedEvents,
  saveEventsToCache,
  shouldRefreshCache,
  fetchAndCacheExternalEvents,
  refreshIfNeeded,
  forceRefreshCache,
};

