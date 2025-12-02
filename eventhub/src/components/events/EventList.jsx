import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Toast } from "@/components/common/Toast";
import { Sorting } from "@/components/common/Sorting";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { FiltersBar } from "@/components/common/FiltersBar";
import { CATEGORIES } from "@/utils/categories";
import { useEvents } from "@/hooks/useEvents";
import { EventItem } from "./EventItem";
import { EditEventForm } from "./EditEventForm";
import { DeleteEventModal } from "./DeleteEventModal";
import { CreateEventModal } from "./CreateEventModal";

export function EventList() {
  const { events, isLoading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  function searchChangeHandler(query) {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }

  function filterCityChangeHandler(city) {
    setFilterCity(city);
    setCurrentPage(1); // Reset to first page when filter changes
  }

  function filterCategoryChangeHandler(category) {
    setFilterCategory(category);
    setCurrentPage(1); // Reset to first page when filter changes
  }

  function filterPriceChangeHandler(price) {
    setFilterPrice(price);
    setCurrentPage(1); // Reset to first page when filter changes
  }

  // Compute unique cities safely
  const uniqueCities = [...new Set(events.map(e => e.city).filter(Boolean))].sort();

  // Apply filtering logic before sorting
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity =
      filterCity === "" || event.city === filterCity;

    const matchesCategory =
      filterCategory === "" || event.category === filterCategory;

    const isFree =
      !event.price ||
      event.price.trim() === "" ||
      event.price.toLowerCase().includes("безплат");

    const matchesPrice =
      filterPrice === "" || (filterPrice === "free" && isFree);

    return matchesSearch && matchesCity && matchesCategory && matchesPrice;
  });

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
  const sortedEvents = sortEvents(filteredEvents);
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
            <FiltersBar
              cities={uniqueCities}
              categories={CATEGORIES}
              selectedCity={filterCity}
              selectedCategory={filterCategory}
              selectedPrice={filterPrice}
              onCityChange={filterCityChangeHandler}
              onCategoryChange={filterCategoryChangeHandler}
              onPriceChange={filterPriceChangeHandler}
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

          {sortedEvents.length === 0 ? (
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
