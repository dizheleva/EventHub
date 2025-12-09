import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFavoritesByUserId,
  addFavorite,
  removeFavorite,
} from "@/api/favoritesApi";

/**
 * useFavorites - Custom hook for managing user favorites
 * 
 * Provides functionality to:
 * - Load all favorites for the logged user
 * - Check if an event is favorite
 * - Toggle favorite with optimistic UI
 * - Automatic sync on login/logout
 * 
 * @returns {Object} { favorites, isFavorite(id), toggleFavorite(id), isLoading }
 */
export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites when user changes (login/logout)
  useEffect(() => {
    async function loadFavorites() {
      if (!isAuthenticated || !user?.id) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userFavorites = await getFavoritesByUserId(user.id);
        setFavorites(userFavorites);
      } catch (err) {
        console.error("Error loading favorites:", err);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, [user?.id, isAuthenticated]);

  /**
   * Check if an event is favorite
   * 
   * @param {number|string} eventId - Event ID to check
   * @returns {boolean} True if favorite, false otherwise
   */
  function checkIsFavorite(eventId) {
    if (!isAuthenticated || !user?.id) {
      return false;
    }
    return favorites.some(fav => fav.eventId === String(eventId));
  }

  /**
   * Toggle favorite for an event
   * Uses optimistic UI - updates state immediately, then syncs with server
   * 
   * @param {number|string} eventId - Event ID to toggle
   * @returns {Promise<boolean>} True if added, false if removed
   */
  async function toggleFavorite(eventId) {
    // If user is not authenticated, do nothing
    if (!isAuthenticated || !user?.id) {
      throw new Error("Трябва да сте влезли в профила си, за да добавяте любими");
    }

    const eventIdStr = String(eventId);
    
    const wasFavorite = checkIsFavorite(eventId);
    
    // Find existing favorite entry
    const existingFavorite = favorites.find(fav => fav.eventId === eventIdStr);

    // Store previous state for rollback
    const previousFavorites = [...favorites];

    // Optimistic update - immediately update UI
    if (wasFavorite) {
      // Remove favorite optimistically
      setFavorites(prev => prev.filter(fav => fav.eventId !== eventIdStr));
    } else {
      // Add favorite optimistically
      const tempFavorite = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        eventId: eventIdStr,
        createdAt: new Date().toISOString(),
      };
      setFavorites(prev => [...prev, tempFavorite]);
    }

    try {
      if (wasFavorite) {
        // Remove favorite from server
        if (existingFavorite) {
          await removeFavorite(existingFavorite.id);
        }
        return false; // Removed
      } else {
        // Add favorite to server
        await addFavorite(user.id, eventId);
        // Reload favorites to ensure consistency
        const updatedFavorites = await getFavoritesByUserId(user.id);
        setFavorites(updatedFavorites);
        return true; // Added
      }
    } catch (err) {
      // On error, rollback to previous state
      console.error("Error toggling favorite:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        eventId,
        eventIdStr,
        userId: user.id
      });
      setFavorites(previousFavorites);
      
      // Re-throw error so caller can handle it (e.g., show toast)
      throw err;
    }
  }

  return {
    favorites,
    isFavorite: checkIsFavorite,
    toggleFavorite,
    isLoading,
  };
}

