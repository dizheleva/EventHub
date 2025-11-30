import { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EventItem } from "./EventItem";
import { EditEventForm } from "./EditEventForm";
import { DeleteEventModal } from "./DeleteEventModal";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  function fetchEvents() {
    setIsLoading(true);
    setError(null);
    
    fetch("http://localhost:5000/events")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || "Възникна грешка при зареждане на събитията");
        setIsLoading(false);
      });
  }

  function handleEditClick(event) {
    setEditingEvent(event);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingEvent(null);
  }

  function handleEventUpdated() {
    // Refresh the event list from server to ensure we have the latest data
    fetchEvents();
  }

  function handleDeleteClick(event) {
    setDeletingEventId(event.id);
    setIsDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setIsDeleteModalOpen(false);
    setDeletingEventId(null);
  }

  function handleEventDeleted() {
    // Refresh the event list from server after deletion
    fetchEvents();
  }

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchEvents} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventItem
            key={event.id}
            event={event}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Редактирай събитие"
      >
        {editingEvent && (
          <EditEventForm
            event={editingEvent}
            onEventUpdated={handleEventUpdated}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <DeleteEventModal
        eventId={deletingEventId}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDeleted={handleEventDeleted}
      />
    </>
  );
}
