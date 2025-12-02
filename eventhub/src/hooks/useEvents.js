import { useState } from "react";

const API_BASE_URL = "http://localhost:5000/events";

export function useEvents(initialLoading = false) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  // Fetch all events
  async function fetchEvents() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(API_BASE_URL);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setEvents(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при зареждане на събитията";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }

  // Create new event
  async function createEvent(eventData) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
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

      const newEvent = await res.json();
      
      // Optimistic update: add to local state
      setEvents(prev => [...prev, newEvent]);
      setIsLoading(false);
      return newEvent;
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при създаване на събитие";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }

  // Update existing event
  async function updateEvent(id, eventData) {
    if (!id) {
      throw new Error("Липсва ID на събитието");
    }

    setError(null);

    // Optimistic update: update in local state immediately
    const originalEvent = events.find(e => e.id === id);
    if (originalEvent) {
      const optimisticUpdate = { ...originalEvent, ...eventData, updatedAt: new Date().toISOString() };
      setEvents(prev => prev.map(event => event.id === id ? optimisticUpdate : event));
    }

    try {
      const updateData = {
        id,
        ...eventData,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        // Revert optimistic update on error
        if (originalEvent) {
          setEvents(prev => prev.map(event => event.id === id ? originalEvent : event));
        }
        
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

      // Get updated event from response
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
      const errorMessage = err.message || "Възникна грешка при обновяване на събитие";
      setError(errorMessage);
      throw err;
    }
  }

  // Delete event with optimistic UI
  async function deleteEvent(id) {
    if (!id) {
      throw new Error("Липсва ID на събитието");
    }

    // Optimistic update: remove from local state immediately
    const deletedEvent = events.find(e => e.id === id);
    if (!deletedEvent) {
      throw new Error("Събитието не беше намерено");
    }

    setEvents(prev => prev.filter(e => e.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        // Revert optimistic update on error
        setEvents(prev => [...prev, deletedEvent]);
        
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

      return true;
    } catch (err) {
      // Revert optimistic update on error
      setEvents(prev => [...prev, deletedEvent]);
      const errorMessage = err.message || "Възникна грешка при изтриване на събитие";
      setError(errorMessage);
      throw err;
    }
  }

  return {
    events,
    isLoading,
    error,
    setEvents,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

