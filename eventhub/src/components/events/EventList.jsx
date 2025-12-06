import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Sorting } from "@/components/common/Sorting";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { GuardedRoute } from "@/components/routing/GuardedRoute";
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
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  
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

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Authorization check before opening edit modal
  // Only owners can edit their events - prevent unauthorized access
  async function editClickHandler(eventId) {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Check if user is the author (creator) - authorization check
    // Support both creatorId (new) and userId (legacy) for backward compatibility
    try {
      const event = events.find(e => e.id === eventId);
      const eventCreatorId = event?.creatorId || event?.userId;
      if (event && eventCreatorId !== user?.id) {
        // User is NOT the owner - prevent unauthorized access
        showToast("error", "Нямате права да редактирате това събитие");
        return; // Prevent opening modal for non-owners
      }
    } catch (err) {
      console.error("Error checking event ownership:", err);
    }

    // User is authorized - open edit modal
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
      showToast("success", "Събитието беше обновено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при обновяване на събитие");
    }
  }

  // Authorization check before opening delete modal
  // Only owners can delete their events - prevent unauthorized access
  function deleteClickHandler(event) {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Check if user is the author (creator) - authorization check
    // Support both creatorId (new) and userId (legacy) for backward compatibility
    const eventCreatorId = event.creatorId || event.userId;
    if (eventCreatorId !== user?.id) {
      // User is NOT the owner - prevent unauthorized access
      showToast("error", "Нямате права да изтривате това събитие");
      return; // Prevent opening modal for non-owners
    }

    // User is authorized - open delete modal
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
    showToast("error", error.message || "Възникна грешка при изтриване на събитие. Събитието беше възстановено.");
  }

  function openCreateModalHandler() {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }
    setShowCreateModal(true);
  }

  function closeCreateModalHandler() {
    setShowCreateModal(false);
  }

  async function eventCreatedHandler(eventData) {
    try {
      // createEvent already handles optimistic update
      // eventData includes creatorId automatically set by EventForm
      await createEvent(eventData);
      closeCreateModalHandler();
      showToast("success", "Събитието е създадено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при създаване на събитие");
      // Don't close modal on error so user can retry
      throw err; // Re-throw to let EventForm handle it
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
      {events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600">Няма намерени събития</p>
        </div>
      ) : (
        <>
          <SearchBar
            value={searchQuery}
            onChange={searchChangeHandler}
          >
            {/* Show "Add Event" button only for authenticated users - on the same level as search bar, far right */}
            {isAuthenticated && (
              <button
                onClick={openCreateModalHandler}
                className="flex items-center gap-2 px-4 h-[42px] bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-color transition-all border border-transparent whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Добави събитие
              </button>
            )}
          </SearchBar>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Sorting
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={sortChangeHandler}
            />
            <EventsFilters
              filters={{ city: selectedCity, category: selectedCategory, price: selectedPrice }}
              onChange={filtersChangeHandler}
              cities={uniqueCities}
            />
          </div>

          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Няма събития по този критерий</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-6">
                <div 
                  className={`grid gap-6 max-w-7xl mx-auto justify-items-center items-stretch ${
                    paginatedEvents.length < 3 
                      ? 'grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,max-content))] lg:grid-cols-[repeat(auto-fit,minmax(300px,max-content))] justify-center' 
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {paginatedEvents.map(event => (
                    <div key={event.id} className="w-full max-w-md h-full">
                      <EventItem
                        event={event}
                        onEdit={editClickHandler}
                        onDelete={deleteClickHandler}
                      />
                    </div>
                  ))}
                </div>
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

      {/* Edit Modal - Only render GuardedRoute when modal is open */}
      {showEditModal && (
        <GuardedRoute>
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
        </GuardedRoute>
      )}

      {/* Delete Modal - Only render GuardedRoute when modal is open */}
      {isDeleteModalOpen && (
        <GuardedRoute>
          <DeleteEventModal
            eventId={deletingEventId}
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModalHandler}
            onDeleted={eventDeletedHandler}
            onError={eventDeleteErrorHandler}
            deleteEvent={deleteEvent}
          />
        </GuardedRoute>
      )}

      {/* Create Event Modal - Only render GuardedRoute when modal is open */}
      {showCreateModal && (
        <GuardedRoute>
          <CreateEventModal
            isOpen={showCreateModal}
            onClose={closeCreateModalHandler}
            onEventCreated={eventCreatedHandler}
          />
        </GuardedRoute>
      )}
    </>
  );
}
