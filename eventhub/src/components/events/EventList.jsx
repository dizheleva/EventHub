import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Toast } from "@/components/common/Toast";
import { Sorting } from "@/components/common/Sorting";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { useEvents } from "@/hooks/useEvents";
import { EventItem } from "./EventItem";
import { EditEventForm } from "./EditEventForm";
import { DeleteEventModal } from "./DeleteEventModal";
import { CreateEventModal } from "./CreateEventModal";
import { EventsFilters } from "./EventsFilters";

// Helper function: Sort events
function sortEvents(eventsList, sortByField, sortOrderValue) {
  const sorted = [...eventsList].sort((a, b) => {
    let aValue = a[sortByField];
    let bValue = b[sortByField];

    // Handle different data types
    if (sortByField === "date") {
      // Compare dates
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    } else {
      // Compare strings (title, location)
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
    }

    if (aValue < bValue) {
      return sortOrderValue === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrderValue === "asc" ? 1 : -1;
    }
    return 0;
  });

  return sorted;
}

export function EventList() {
  const { events, isLoading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  
  // Sort states
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  // Modal states
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  function editClickHandler(eventId) {
    setSelectedEventId(eventId);
    setShowEditModal(true);
  }

  function closeEditModalHandler() {
    setShowEditModal(false);
    setSelectedEventId(null);
  }

  async function eventUpdatedHandler(updatedEvent) {
    try {
      // updateEvent already handles optimistic update
      await updateEvent(updatedEvent.id, updatedEvent);
      closeEditModalHandler();
      setToast({
        type: "success",
        message: "Събитието беше обновено успешно!",
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при обновяване на събитие",
      });
      setTimeout(() => setToast(null), 3000);
    }
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
    // This is called after successful deletion in DeleteEventModal
    // No additional action needed as deleteEvent hook handles everything
  }

  function eventDeleteErrorHandler(eventId, error) {
    // Error handling is done in deleteEvent hook (revert state)
    // Show additional toast if needed
    setToast({
      type: "error",
      message: error.message || "Възникна грешка при изтриване на събитие. Събитието беше възстановено.",
    });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreateModalHandler() {
    setShowCreateModal(true);
  }

  function closeCreateModalHandler() {
    setShowCreateModal(false);
  }

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

  // Handlers that reset pagination
  function searchChangeHandler(query) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function filtersChangeHandler(updatedFilters) {
    setSelectedCity(updatedFilters.city || "");
    setSelectedCategory(updatedFilters.category || "");
    setSelectedPrice(updatedFilters.price || "");
    setCurrentPage(1);
  }

  // Compute unique cities safely
  const uniqueCities = useMemo(() => {
    return [...new Set(events.map(e => e.city).filter(Boolean))].sort();
  }, [events]);

  // Apply all filters and sorting using useMemo for optimization
  // Pipeline: events → search → city → category → price → sort
  const filteredAndSortedEvents = useMemo(() => {
    // Step 1: Apply search filter
    let filtered = events.filter(event => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        event.title?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    });

    // Step 2: Apply city filter (exact match)
    if (selectedCity) {
      filtered = filtered.filter(event => event.city === selectedCity);
    }

    // Step 3: Apply category filter (exact match)
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Step 4: Apply price filter
    if (selectedPrice === "free") {
      filtered = filtered.filter(event => {
        const priceValue = event.price || "";
        const priceLower = priceValue.toLowerCase();
        return (
          priceValue === "Безплатно" ||
          priceLower.includes("безплат") ||
          priceLower.includes("free")
        );
      });
    }

    // Step 5: Apply sorting
    filtered = sortEvents(filtered, sortBy, sortOrder);

    return filtered;
  }, [events, searchQuery, selectedCity, selectedCategory, selectedPrice, sortBy, sortOrder]);

  // Calculate pagination
  const totalItems = filteredAndSortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, endIndex);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // Error state
  if (error) return <ErrorMessage message={error} onRetry={fetchEvents} />;

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600">Няма намерени събития</p>
        </div>
      ) : (
        <>
          <SearchBar
            value={searchQuery}
            onChange={searchChangeHandler}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <EventsFilters
              filters={{ city: selectedCity, category: selectedCategory, price: selectedPrice }}
              onChange={filtersChangeHandler}
              cities={uniqueCities}
            />
            <Sorting
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={sortChangeHandler}
            />
          </div>

          <div className="mb-6 flex justify-end">
            <button
              onClick={openCreateModalHandler}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-color transition-all border border-transparent"
            >
              <Plus className="w-4 h-4" />
              Добави събитие
            </button>
          </div>

          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Няма събития по този критерий</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-6 max-w-7xl mx-auto justify-items-center">
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
        onError={eventDeleteErrorHandler}
        deleteEvent={deleteEvent}
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
