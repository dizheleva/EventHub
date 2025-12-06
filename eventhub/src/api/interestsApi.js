const API_BASE_URL = "http://localhost:5000/interests";

/**
 * Get all interests for a specific event
 * 
 * @param {number|string} eventId - Event ID
 * @returns {Promise<Array>} List of interest objects
 */
export async function getInterestsByEvent(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}?eventId=${eventId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при зареждане на интересите: ${response.status} ${response.statusText}`);
    }

    const interests = await response.json();
    return interests;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при зареждане на интересите";
    throw new Error(errorMessage);
  }
}

/**
 * Get interest for a specific user and event
 * Returns the interest object if found, or null if not found
 * 
 * @param {number|string} eventId - Event ID
 * @param {number|string} userId - User ID
 * @returns {Promise<Object|null>} Interest object or null
 */
export async function getUserInterest(eventId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}?eventId=${eventId}&userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при зареждане на интереса: ${response.status} ${response.statusText}`);
    }

    const interests = await response.json();
    
    // Return the first matching interest or null
    return interests.length > 0 ? interests[0] : null;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при зареждане на интереса";
    throw new Error(errorMessage);
  }
}

/**
 * Add a new interest (user expresses interest in an event)
 * 
 * @param {number|string} eventId - Event ID
 * @param {number|string} userId - User ID
 * @returns {Promise<Object>} Created interest object
 */
export async function addInterest(eventId, userId) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: Number(eventId),
        userId: Number(userId),
      }),
    });

    if (!response.ok) {
      throw new Error(`Грешка при добавяне на интерес: ${response.status} ${response.statusText}`);
    }

    const interest = await response.json();
    return interest;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при добавяне на интерес";
    throw new Error(errorMessage);
  }
}

/**
 * Remove an interest by ID
 * 
 * @param {number|string} interestId - Interest ID to remove
 * @returns {Promise<boolean>} True if successful
 */
export async function removeInterest(interestId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${interestId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Грешка при премахване на интерес: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при премахване на интерес";
    throw new Error(errorMessage);
  }
}

