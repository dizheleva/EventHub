const API_BASE_URL = "http://localhost:5000/favorites";

/**
 * Get all favorites for a specific user
 * 
 * @param {number|string} userId - User ID to get favorites for
 * @returns {Promise<Array>} List of favorite objects
 */
export async function getFavoritesByUserId(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при зареждане на любимите: ${response.status} ${response.statusText}`);
    }

    const favorites = await response.json();
    return favorites;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при зареждане на любимите";
    throw new Error(errorMessage);
  }
}

/**
 * Add a favorite (user likes an event)
 * 
 * @param {number|string} userId - User ID
 * @param {number|string} eventId - Event ID
 * @returns {Promise<Object>} Created favorite object
 */
export async function addFavorite(userId, eventId) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
        eventId: String(eventId),
        createdAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Грешка при добавяне на любимо: ${response.status} ${response.statusText}`);
    }

    const favorite = await response.json();
    return favorite;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при добавяне на любимо";
    throw new Error(errorMessage);
  }
}

/**
 * Remove a favorite by favorite ID
 * 
 * @param {number|string} favoriteId - Favorite ID to remove
 * @returns {Promise<void>}
 */
export async function removeFavorite(favoriteId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${favoriteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Грешка при премахване на любимо: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при премахване на любимо";
    throw new Error(errorMessage);
  }
}

/**
 * Toggle favorite status (add if not favorite, remove if favorite)
 * 
 * @param {number|string} userId - User ID
 * @param {number|string} eventId - Event ID
 * @returns {Promise<boolean>} True if added, false if removed
 */
export async function toggleFavorite(userId, eventId) {
  try {
    // Check if already favorite
    const isFav = await isFavorite(userId, eventId);
    
    if (isFav) {
      // Remove favorite
      const favorites = await getFavoritesByUserId(userId);
      const favorite = favorites.find(
        fav => fav.userId === Number(userId) && fav.eventId === String(eventId)
      );
      
      if (favorite) {
        await removeFavorite(favorite.id);
        return false; // Removed
      }
    } else {
      // Add favorite
      await addFavorite(userId, eventId);
      return true; // Added
    }
    
    return !isFav;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при промяна на любимо";
    throw new Error(errorMessage);
  }
}

/**
 * Check if an event is favorite for a user
 * 
 * @param {number|string} userId - User ID
 * @param {number|string} eventId - Event ID
 * @returns {Promise<boolean>} True if favorite, false otherwise
 */
export async function isFavorite(userId, eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}&eventId=${eventId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при проверка на любимо: ${response.status} ${response.statusText}`);
    }

    const favorites = await response.json();
    return favorites.length > 0;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при проверка на любимо";
    throw new Error(errorMessage);
  }
}

