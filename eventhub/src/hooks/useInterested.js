import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getInterestsByEvent,
  getUserInterest,
  addInterest,
  removeInterest,
} from "@/api/interestsApi";

/**
 * useInterested - Custom hook for managing user interest in events
 * 
 * Provides functionality to:
 * - Track how many users are interested in an event
 * - Track if the current user is interested
 * - Toggle interest with optimistic UI
 * 
 * @param {number|string} eventId - Event ID
 * @returns {Object} { toggleInterest, interestsCount, userInterested, loading }
 */
export function useInterested(eventId) {
  const { user, isAuthenticated } = useAuth();
  const [interestsCount, setInterestsCount] = useState(0);
  const [userInterested, setUserInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentInterestId, setCurrentInterestId] = useState(null);

  // Load interests data when eventId or user changes
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    async function loadInterests() {
      setLoading(true);
      try {
        // Get all interests for this event
        const allInterests = await getInterestsByEvent(eventId);
        setInterestsCount(allInterests.length);

        // Check if current user is interested (only if authenticated)
        if (isAuthenticated && user?.id) {
          const userInterest = await getUserInterest(eventId, user.id);
          if (userInterest) {
            setUserInterested(true);
            setCurrentInterestId(userInterest.id);
          } else {
            setUserInterested(false);
            setCurrentInterestId(null);
          }
        } else {
          // User not authenticated - not interested
          setUserInterested(false);
          setCurrentInterestId(null);
        }
      } catch (err) {
        console.error("Error loading interests:", err);
        // On error, keep current state but stop loading
      } finally {
        setLoading(false);
      }
    }

    loadInterests();
  }, [eventId, user?.id, isAuthenticated]);

  /**
   * Toggle interest for the current user
   * Uses optimistic UI - updates state immediately, then syncs with server
   */
  async function toggleInterest() {
    // If user is not authenticated, do nothing
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // Store previous state for rollback
    const previousInterested = userInterested;
    const previousCount = interestsCount;
    const previousInterestId = currentInterestId;

    // Optimistic update - immediately update UI
    if (previousInterested) {
      // Remove interest optimistically
      setUserInterested(false);
      setInterestsCount(prev => Math.max(0, prev - 1));
      setCurrentInterestId(null);
    } else {
      // Add interest optimistically
      setUserInterested(true);
      setInterestsCount(prev => prev + 1);
      // We don't know the ID yet, will be set after server response
    }

    try {
      if (previousInterested) {
        // Remove interest from server
        if (previousInterestId) {
          await removeInterest(previousInterestId);
        }
        // State already updated optimistically
      } else {
        // Add interest to server
        const newInterest = await addInterest(eventId, user.id);
        // Update with real ID from server
        setCurrentInterestId(newInterest.id);
      }
    } catch (err) {
      // On error, rollback to previous state
      console.error("Error toggling interest:", err);
      setUserInterested(previousInterested);
      setInterestsCount(previousCount);
      setCurrentInterestId(previousInterestId);
      
      // Re-throw error so caller can handle it (e.g., show toast)
      throw err;
    }
  }

  return {
    toggleInterest,
    interestsCount,
    userInterested,
    loading,
  };
}

