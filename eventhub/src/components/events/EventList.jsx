import { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Sorting } from "@/components/common/Sorting";
import { Pagination } from "@/components/common/Pagination";
import { EventItem } from "./EventItem";
import { EditEventForm } from "./EditEventForm";
import { DeleteEventModal } from "./DeleteEventModal";
import { CreateEventModal } from "./CreateEventModal";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  function editClickHandler(eventId) {
    setSelectedEventId(eventId);
    setShowEditModal(true);
  }

  function closeEditModalHandler() {
    setShowEditModal(false);
    setSelectedEventId(null);
  }

  function eventUpdatedHandler(updatedEvent) {
    // Optimistically update the event in local state without full refetch
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    closeEditModalHandler();
  }

  function deleteClickHandler(event) {
    setDeletingEventId(event.id);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModalHandler() {
    setIsDeleteModalOpen(false);
    setDeletingEventId(null);
  }

  function eventDeletedHandler() {
    // Refresh the event list from server after deletion
    fetchEvents();
  }

  function openCreateModalHandler() {
    setShowCreateModal(true);
  }

  function closeCreateModalHandler() {
    setShowCreateModal(false);
  }

  function eventCreatedHandler(newEvent) {
    // Append created event to state without full refetch
    setEvents(prevEvents => [...prevEvents, newEvent]);
    closeCreateModalHandler();
  }

  function pageChangeHandler(newPage) {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function itemsPerPageChangeHandler(newItemsPerPage) {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }

  function sortChangeHandler(newSortBy, newSortOrder) {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
  }

  // Sort events using array.sort()
  function sortEvents(eventsList) {
    const sorted = [...eventsList].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === "date") {
        // Compare dates
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else {
        // Compare strings (title, location)
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      }

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }

  // Calculate sorted and paginated events
  const sortedEvents = sortEvents(events);
  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get paginated events
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = sortedEvents.slice(startIndex, endIndex);

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (error) return <ErrorMessage message={error} onRetry={fetchEvents} />;

  return (
    <>
      {/* Add Event Button */}
      <div className="mb-6 text-center">
        <button
          onClick={openCreateModalHandler}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color hover:scale-[1.02] transition-all"
        >
          Добави събитие
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600">Няма намерени събития</p>
        </div>
      ) : (
        <>
          <Sorting
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={sortChangeHandler}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center m-10 px-8 gap-4">
            {paginatedEvents.map(event => (
              <EventItem
                key={event.id}
                event={event}
                onEdit={editClickHandler}
                onDelete={deleteClickHandler}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={pageChangeHandler}
            onItemsPerPageChange={itemsPerPageChangeHandler}
          />
        </>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModalHandler}
        title="Редактирай събитие"
      >
        {selectedEventId && (
          <EditEventForm
            eventId={selectedEventId}
            onEventUpdated={eventUpdatedHandler}
            onClose={closeEditModalHandler}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <DeleteEventModal
        eventId={deletingEventId}
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModalHandler}
        onDeleted={eventDeletedHandler}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={closeCreateModalHandler}
        onEventCreated={eventCreatedHandler}
      />
    </>
  );
}
