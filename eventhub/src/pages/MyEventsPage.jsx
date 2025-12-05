import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarX } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EventItem } from "@/components/events/EventItem";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { Toast } from "@/components/common/Toast";

export function MyEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { events, isLoading, error, fetchEvents, createEvent } = useEvents(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Scroll to top on component mount
  // This ensures the page starts at the top when navigating to MyEventsPage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch events when component mounts
  // This ensures events are loaded when user navigates to this page
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Filter events to show only those created by the current user
  // Support ownerId (required), creatorId (new), and userId (legacy) for backward compatibility
  // Events without ownerId/creatorId/userId are safely ignored
  const myEvents = useMemo(() => {
    if (!isAuthenticated || !user) {
      return [];
    }

    return events.filter(event => {
      // Get ownerId (required field), creatorId (new field), or userId (legacy field) for backward compatibility
      const eventOwnerId = event.ownerId || event.creatorId || event.userId;
      
      // Only include events that have an ownerId/creatorId/userId and match current user
      // Safely ignore events without ownerId/creatorId/userId (backward compatibility)
      return eventOwnerId && eventOwnerId === user.id;
    });
  }, [events, user, isAuthenticated]);

  // Handle opening create modal
  function openCreateModalHandler() {
    if (!isAuthenticated) {
      setToast({
        type: "error",
        message: "Моля, влезте в профила си.",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setShowCreateModal(true);
  }

  function closeCreateModalHandler() {
    setShowCreateModal(false);
  }

  // Handle event created - refresh the list
  async function eventCreatedHandler(eventData) {
    try {
      // createEvent already handles optimistic update
      await createEvent(eventData);
      closeCreateModalHandler();
      setToast({
        type: "success",
        message: "Събитието е създадено успешно!",
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при създаване на събитие",
      });
      setTimeout(() => setToast(null), 3000);
    }
  }

  // Handle edit - navigate to events page where edit functionality is available
  // User can edit from the main events list
  // Parameters are required by EventItem interface but not used here
  // eslint-disable-next-line no-unused-vars
  function handleEdit(eventId) {
    navigate(`/events`);
    // Note: Edit functionality is available in EventList component
  }

  // Handle delete - the useEvents hook will automatically update the list
  // No additional action needed as deleteEvent handles optimistic updates
  // Parameters are required by EventItem interface but not used here
  // eslint-disable-next-line no-unused-vars
  function handleDelete(event) {
    // After deletion, myEvents will automatically update via useEvents hook
    // The filter will re-run and the deleted event will disappear
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Моля, влезте в профила си, за да видите вашите събития.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Зареждане на вашите събития..." />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchEvents} />;
  }

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header with title and create button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl font-bold text-gray-900 text-center sm:text-left">
          Моите събития
        </h2>
        
        {/* Create Event Button */}
        <button
          onClick={openCreateModalHandler}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Създай събитие
        </button>
      </div>

      {/* Events List or Empty State */}
      {myEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex flex-col items-center gap-4">
            <CalendarX className="w-16 h-16 text-gray-400" />
            <p className="text-xl text-gray-600 font-medium">
              Нямате добавени събития.
            </p>
            <button
              onClick={openCreateModalHandler}
              className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all"
            >
              <Plus className="w-5 h-5" />
              Добави събитие
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-6 max-w-7xl mx-auto justify-items-center">
          {myEvents.map(event => (
            <EventItem
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={closeCreateModalHandler}
          onEventCreated={eventCreatedHandler}
        />
      )}
    </section>
  );
}

