import { useState, useCallback, useOptimistic } from "react";
import { API_BASE_URL } from "@/config/api";
import { normalizeEvent } from "@/utils/eventHelpers";
import { getAllEvents, getExternalEvents } from "@/api/externalEventsApi";

const EVENTS_API_URL = `${API_BASE_URL}/events`;

// Simple in-memory cache for external events (lasts for session)
let externalEventsCache = null;
let externalEventsCacheTime = null;
const EXTERNAL_EVENTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useEvents(initialLoading = false) {
  const [events, setEvents] = useState([]);
  const [externalEvents, setExternalEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [error, setError] = useState(null);
  const [externalError, setExternalError] = useState(null);

  // Optimistic reducer for events
  function eventsReducer(state, action) {
    switch (action.type) {
      case 'ADD':
        return [...state, action.payload];
      case 'UPDATE':
        return state.map(event => event.id === action.payload.id ? action.payload : event);
      case 'DELETE':
        return state.filter(event => event.id !== action.payload.id);
      case 'REPLACE':
        return action.payload;
      default:
        return state;
    }
  }

  // Use useOptimistic for cleaner optimistic UI updates
  // Note: useOptimistic automatically syncs with the base state (events)
  const [optimisticEvents, dispatchOptimistic] = useOptimistic(events, eventsReducer);

  // Fetch all events
  // Returns events with creatorId field (or userId for legacy events)
  // UI can check ownership using creatorId/userId
  async function fetchEvents() {
    setError(null);

    try {        
      setIsLoading(true);
      const res = await fetch(EVENTS_API_URL);      
      if (!res.ok) throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
      const data = await res.json();
      // Normalize all events to new format
      const normalizedEvents = data.map(event => normalizeEvent(event));
      setEvents(normalizedEvents);
      return normalizedEvents;
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при зареждане на събитията";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  // Create new event with Optimistic UI using useOptimistic
  async function createEvent(eventData) {
    setError(null);

    // Step 1: Optimistic create - immediately add event to local state with temporary ID
    const tempId = "temp-" + Date.now();
    const optimisticEvent = {
      ...eventData,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Use useOptimistic for instant UI update
    // Don't update real state here - let useOptimistic handle it
    dispatchOptimistic({ type: 'ADD', payload: optimisticEvent });

    try {
      // Step 2: Call POST /events to create event on server
      const res = await fetch(EVENTS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        // Step 4: On failure - remove optimistic event
        // useOptimistic will automatically revert when we update the real state
        setEvents(prev => prev.filter(e => e.id !== tempId));
        
        let errorMessage = "Грешка при създаване на събитие";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        throw new Error(`Грешка ${res.status}: ${errorMessage}`);
      }

      // Step 3: On success - get real event from server response
      const responseText = await res.text();
      
      let newEvent;
      if (responseText) {
        try {
          newEvent = JSON.parse(responseText);
        } catch {
          newEvent = {
            ...eventData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        newEvent = {
          ...eventData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Replace temporary ID with real ID from server
      setEvents(prev => prev.map(event => 
        event.id === tempId ? newEvent : event
      ));
      
      return newEvent;
    } catch (err) {
      // Step 4: On failure - ensure optimistic event is removed
      // useOptimistic will automatically revert when we update the real state
      setEvents(prev => prev.filter(e => e.id !== tempId));
      
      const errorMessage = err.message || "Възникна грешка при създаване на събитие";
      setError(errorMessage);
      throw err;
    }
  }

  // Update existing event with Optimistic UI using useOptimistic
  async function updateEvent(id, eventData) {
    if (!id) {
      throw new Error("Липсва ID на събитието");
    }

    setError(null);

    // Find original event for rollback in case of failure
    const originalEvent = events.find(e => e.id === id);
    
    // If event is not in the list, still proceed with the update
    // (useful for EventDetails page where event is loaded separately)
    // We'll just update the server and skip optimistic update
    if (!originalEvent) {
      // Still update on server, but skip optimistic UI update
      try {
        const updateData = {
          id,
          ...eventData,
          updatedAt: new Date().toISOString(),
        };

        const res = await fetch(`${EVENTS_API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) {
          let errorMessage = "Грешка при обновяване на събитие";
          try {
            const errorText = await res.text();
            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
              } catch {
                errorMessage = errorText || errorMessage;
              }
            }
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
          }
          throw new Error(`Грешка ${res.status}: ${errorMessage}`);
        }

        // Return updated event from server
        const responseText = await res.text();
        if (responseText) {
          try {
            return JSON.parse(responseText);
          } catch {
            return { id, ...updateData };
          }
        } else {
          return { id, ...updateData };
        }
      } catch (err) {
        const errorMessage = err.message || "Възникна грешка при обновяване на събитие";
        setError(errorMessage);
        throw err;
      }
    }

    // Step 1: Optimistic update - immediately update event in local state
    const originalOwnerId = originalEvent.ownerId || originalEvent.creatorId || originalEvent.userId;
    const optimisticUpdate = { 
      ...originalEvent, 
      ...eventData, 
      ownerId: eventData.ownerId !== undefined ? eventData.ownerId : originalOwnerId,
      creatorId: eventData.creatorId !== undefined ? eventData.creatorId : (originalEvent.creatorId || originalEvent.userId),
      updatedAt: new Date().toISOString() 
    };
    
    // Use useOptimistic for instant UI update
    // Don't update real state here - let useOptimistic handle it
    dispatchOptimistic({ type: 'UPDATE', payload: optimisticUpdate });

    try {
      // Step 2: Call PUT /events/:id to update event on server
      const updateData = {
        id,
        ...eventData,
        ownerId: eventData.ownerId !== undefined ? eventData.ownerId : originalOwnerId,
        creatorId: eventData.creatorId !== undefined ? eventData.creatorId : (originalEvent.creatorId || originalEvent.userId),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`${EVENTS_API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        // Step 4: On failure - rollback to original state
        setEvents(prev => prev.map(event => event.id === id ? originalEvent : event));
        
        let errorMessage = "Грешка при обновяване на събитие";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        throw new Error(`Грешка ${res.status}: ${errorMessage}`);
      }

      // Step 3: On success - get updated event from server response
      let updatedEvent;
      const responseText = await res.text();
      if (responseText) {
        try {
          updatedEvent = JSON.parse(responseText);
        } catch {
          updatedEvent = { id, ...updateData };
        }
      } else {
        updatedEvent = { id, ...updateData };
      }

      // Update with server response
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      // Step 4: On failure - ensure rollback to original state
      setEvents(prev => prev.map(event => event.id === id ? originalEvent : event));
      
      const errorMessage = err.message || "Възникна грешка при обновяване на събитие";
      setError(errorMessage);
      throw err;
    }
  }

  // Delete event with Optimistic UI using useOptimistic
  async function deleteEvent(id) {
    if (!id) {
      throw new Error("Липсва ID на събитието");
    }

    // Find event to delete
    const deletedEvent = events.find(e => e.id === id);
    if (!deletedEvent) {
      throw new Error("Събитието не беше намерено");
    }

    // Step 1: Store backup for rollback
    const eventsBackup = [...events];

    // Step 2: Optimistic delete - immediately remove event from local state
    // Use useOptimistic for instant UI update
    // Don't update real state here - let useOptimistic handle it
    dispatchOptimistic({ type: 'DELETE', payload: { id } });

    try {
      // Step 3: Call DELETE /events/:id to delete event on server
      const res = await fetch(`${EVENTS_API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        // Step 4: On failure - restore backup
        setEvents(eventsBackup);
        
        let errorMessage = "Грешка при изтриване на събитие";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        throw new Error(`Грешка ${res.status}: ${errorMessage}`);
      }

      // Success - event is already removed (optimistic update)
      return true;
    } catch (err) {
      // Step 4: On failure - ensure backup is restored
      setEvents(eventsBackup);
      
      const errorMessage = err.message || "Възникна грешка при изтриване на събитие";
      setError(errorMessage);
      throw err;
    }
  }

  // Fetch external events from cached server endpoint (no direct scraping)
  // Uses in-memory cache to avoid repeated requests
  const fetchExternalEventsData = useCallback(async (options = {}) => {
    setExternalError(null);
    
    // Check in-memory cache first
    const now = Date.now();
    if (externalEventsCache && externalEventsCacheTime && 
        (now - externalEventsCacheTime) < EXTERNAL_EVENTS_CACHE_DURATION) {
      let filteredEvents = externalEventsCache;
      
      // Apply city filter if specified
      if (options.city) {
        filteredEvents = applyCityFilter(externalEventsCache, options.city);
      }
      
      setExternalEvents(filteredEvents);
      return filteredEvents;
    }
    
    setIsLoadingExternal(true);

    try {
      // Get cached external events from server (includes Varna + AllEvents)
      const events = await getExternalEvents();
      
      // Update in-memory cache
      externalEventsCache = events;
      externalEventsCacheTime = Date.now();
      
      // Apply city filter if specified (client-side filtering)
      let filteredEvents = events;
      if (options.city) {
        filteredEvents = applyCityFilter(events, options.city);
      }
      
      setExternalEvents(filteredEvents);
      return filteredEvents;
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при зареждане на външни събития";
      setExternalError(errorMessage);
      console.error("Error fetching external events:", err);
      
      // Try to use stale cache if available
      if (externalEventsCache) {
        let filteredEvents = externalEventsCache;
        if (options.city) {
          filteredEvents = applyCityFilter(externalEventsCache, options.city);
        }
        setExternalEvents(filteredEvents);
        return filteredEvents;
      }
      
      // Don't throw - allow internal events to still display
      return [];
    } finally {
      setIsLoadingExternal(false);
    }
  }, []); // Empty deps - function doesn't depend on any props/state
  
  // Helper function to apply city filter
  function applyCityFilter(events, city) {
    const cityMap = {
      "София": "Sofia",
      "Sofia": "Sofia",
      "Варна": "Varna",
      "Varna": "Varna",
      "Пловдив": "Plovdiv",
      "Plovdiv": "Plovdiv",
      "Бургас": "Burgas",
      "Burgas": "Burgas",
      "Русе": "Ruse",
      "Ruse": "Ruse",
    };
    
    const englishCity = cityMap[city] || city;
    const normalizedCity = englishCity.toLowerCase();
    
    // Filter by city (case-insensitive)
    return events.filter(event => {
      const eventCity = event.location?.city?.toLowerCase() || "";
      return eventCity.includes(normalizedCity) || 
             eventCity.includes(city.toLowerCase());
    });
  }

  return {
    events: optimisticEvents, // Return optimistic events for instant UI updates
    externalEvents,
    isLoading,
    isLoadingExternal,
    error,
    externalError,
    setEvents,
    fetchEvents,
    fetchExternalEvents: fetchExternalEventsData,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

