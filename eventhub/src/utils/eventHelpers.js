/**
 * Calculate duration in minutes between start and end date
 * 
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {number|null} Duration in minutes, or null if invalid
 */
export function calculateDurationMinutes(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    
    if (end <= start) {
      return null; // Invalid: end must be after start
    }
    
    const diffMs = end - start;
    return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
  } catch {
    return null;
  }
}

/**
 * Format duration in minutes to human-readable string
 * 
 * @param {number|null} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m", "45m", "неизвестно")
 */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "неизвестно";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}ч ${mins}м`;
  } else if (hours > 0) {
    return `${hours}ч`;
  } else {
    return `${mins}м`;
  }
}

/**
 * Normalize event data from old format to new format
 * Provides backward compatibility for existing events
 * 
 * @param {Object} event - Event object (may be in old or new format)
 * @returns {Object} Normalized event with all new fields
 */
export function normalizeEvent(event) {
  if (!event) return null;

  // Extract legacy fields
  const legacyDate = event.date;
  const legacyPrice = event.price;
  const legacyCreatorId = event.creatorId || event.userId || event.ownerId;

  // Parse location
  let location = event.location;
  if (typeof location === 'string') {
    // Old format: location is a string
    location = {
      address: location,
      city: event.city || null,
      country: "България", // Always Bulgaria
      coordinates: null
    };
  } else if (!location || typeof location !== 'object') {
    // No location or invalid
    location = {
      address: null,
      city: event.city || null,
      country: "България", // Always Bulgaria
      coordinates: null
    };
  } else {
    // Ensure country is always Bulgaria
    location = {
      ...location,
      country: "България",
      coordinates: null // Remove coordinates
    };
  }

  // Parse dates
  let startDate = event.startDate || legacyDate || null;
  let endDate = event.endDate || legacyDate || null;
  
  // If we have legacy date but no start/end dates, use it for both
  if (legacyDate && !event.startDate && !event.endDate) {
    startDate = legacyDate;
    endDate = legacyDate;
  }

  // Calculate duration
  const durationMinutes = event.durationMinutes || calculateDurationMinutes(startDate, endDate);

  // Parse price
  let price = 0;
  if (event.price !== null && event.price !== undefined) {
    price = typeof event.price === 'number' ? event.price : 0;
  } else if (legacyPrice) {
    const priceLower = String(legacyPrice).toLowerCase();
    if (priceLower.includes("безплатно") || priceLower.includes("free") || priceLower === "0") {
      price = 0;
    } else {
      // Try to extract numeric value
      const match = String(legacyPrice).match(/(\d+(?:[.,]\d+)?)/);
      if (match) {
        price = parseFloat(match[1].replace(',', '.'));
      }
    }
  }

  // Parse isOnline
  let isOnline = event.isOnline;
  if (isOnline === undefined || isOnline === null) {
    // Infer from location type or meetingUrl
    if (event.locationType === "online" || event.meetingUrl) {
      isOnline = true;
    } else if (event.locationType === "physical" || location.address) {
      isOnline = false;
    } else {
      isOnline = false; // Default to physical
    }
  }

  // Parse tags
  let tags = event.tags;
  if (!Array.isArray(tags)) {
    tags = [];
  }

  return {
    // Core fields
    id: event.id,
    title: event.title || "",
    description: event.description || "",
    category: event.category || "",
    
    // Location
    location: location,
    
    // Schedule
    startDate: startDate,
    endDate: endDate,
    durationMinutes: durationMinutes,
    
    // Media
    imageUrl: event.imageUrl || null,
    websiteUrl: event.websiteUrl || null,
    
    // Tickets
    price: price,
    
    // Type
    isOnline: isOnline,
    
    // Metadata
    createdAt: event.createdAt || new Date().toISOString(),
    creatorId: legacyCreatorId,
    
    // Tags
    tags: tags,
  };
}

/**
 * Get formatted location string
 * 
 * @param {Object} event - Event object
 * @returns {string} Formatted location string
 */
export function getLocationString(event) {
  if (!event) return "";
  
  const normalized = normalizeEvent(event);
  
  if (normalized.isOnline) {
    return "Онлайн";
  }
  
  if (normalized.location) {
    const parts = [];
    if (normalized.location.address) parts.push(normalized.location.address);
    if (normalized.location.city) parts.push(normalized.location.city);
    if (normalized.location.country) parts.push(normalized.location.country);
    return parts.join(", ") || "Локация да бъде обявена";
  }
  
  return "Локация да бъде обявена";
}

/**
 * Format price for display
 * 
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export function formatEventPrice(price) {
  if (price === null || price === undefined || price === 0) {
    return "Безплатно";
  }
  return `${price.toFixed(2)} лв`;
}
