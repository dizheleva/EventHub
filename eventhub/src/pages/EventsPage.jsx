import { useEffect, useRef } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useEventModals } from "@/hooks/useEventModals";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import EventList from "@/components/events/EventList";
import AddEventButton from "@/components/events/AddEventButton";
import SearchBar from "@/components/common/SearchBar";
import EventsFiltersBar from "@/components/events/Filters/EventsFilters";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import NoEventsState from "@/components/events/NoEventsState";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CreateEventModal from "@/components/events/Forms/CreateEventModal";

export default function EventsPage() {
  const { 
    events, 
    externalEvents, 
    isLoading, 
    isLoadingExternal,
    error, 
    externalError,
    fetchEvents, 
    fetchExternalEvents,
    createEvent
  } = useEvents(true);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Use custom hooks for filters and modals
  const {
    filteredEvents,
    paginatedEvents,
    uniqueCities,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    handlers
  } = useEventFilters(events, externalEvents);
  
  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal
  } = useEventModals(events);
  
  // Track if we've already fetched on mount
  const hasFetchedOnMount = useRef(false);

  useEffect(() => {
    fetchEvents();
    // Always fetch external events on mount (includes Varna scraper even without AllEvents API key)
    if (!hasFetchedOnMount.current) {
      fetchExternalEvents({ city: filters.city || undefined });
      hasFetchedOnMount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Refetch external events when city filter changes (with debounce to avoid too many requests)
  useEffect(() => {
    // Skip on initial mount (already handled by first useEffect)
    if (!hasFetchedOnMount.current) {
      return;
    }
    
    // Debounce: wait 500ms before making request
    const timeoutId = setTimeout(() => {
      if (filters.city) {
        fetchExternalEvents({ city: filters.city });
      } else {
        fetchExternalEvents(); // Fetch all Bulgaria events (includes Varna scraper)
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city]); // Only depend on city filter, not fetchExternalEvents

  const eventCreatedHandler = async (eventData) => {
    try {
      // createEvent already handles optimistic update
      // eventData includes creatorId automatically set by EventForm
      await createEvent(eventData);
      closeCreateModal();
      showToast("success", "Събитието е създадено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при създаване на събитие");
      // Don't close modal on error so user can retry
      throw err; // Re-throw to let EventForm handle it
    }
  };

  // Determine if we should show empty state
  const hasLocalEvents = events.length > 0;
  const hasExternalEvents = externalEvents.length > 0;
  const hasAnyEvents = hasLocalEvents || hasExternalEvents;
  const showEmptyState = !hasAnyEvents || filteredEvents.length === 0;

  // Error state for internal events
  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Всички събития</h2>
        <ErrorMessage message={error} onRetry={fetchEvents} />
      </section>
    );
  }

  // Loading state - show skeleton cards but keep UI controls visible
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Всички събития</h2>
        
        {isAuthenticated && (
          <AddEventButton onClick={openCreateModal} variant="inline" />
        )}
        <SearchBar
          value={filters.searchQuery}
          onChange={handlers.searchChange}
        />
        <EventsFiltersBar
          filters={{ source: filters.source, city: filters.city, category: filters.category, price: filters.price, date: filters.date }}
          onFiltersChange={handlers.filtersChange}
          onSortChange={handlers.sortChange}
          cities={uniqueCities}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
        />

        {/* External events loading indicator */}
        {isLoadingExternal && (
          <LoadingSpinner message="Зареждане на външни събития..." variant="inline" />
        )}

        <EventList events={[]} isLoading={true} />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Всички събития</h2>
      
      {showEmptyState ? (
        <>
          {isAuthenticated && (
            <AddEventButton onClick={openCreateModal} variant="inline" />
          )}
          <SearchBar
            value={filters.searchQuery}
            onChange={handlers.searchChange}
          />
          <EventsFiltersBar
            filters={{ source: filters.source, city: filters.city, category: filters.category, price: filters.price, date: filters.date }}
            onFiltersChange={handlers.filtersChange}
            onSortChange={handlers.sortChange}
            cities={uniqueCities}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />
          <NoEventsState
            hasAnyEvents={hasAnyEvents}
            hasLocalEvents={hasLocalEvents}
            sourceFilter={filters.source}
            isAuthenticated={isAuthenticated}
            onClearFilters={handlers.clearAllFilters}
            onCreateEvent={openCreateModal}
          />
        </>
      ) : (
        <>
          {isAuthenticated && (
            <AddEventButton onClick={openCreateModal} variant="inline" />
          )}
          <SearchBar
            value={filters.searchQuery}
            onChange={handlers.searchChange}
          />
          <EventsFiltersBar
            filters={{ source: filters.source, city: filters.city, category: filters.category, price: filters.price, date: filters.date }}
            onFiltersChange={handlers.filtersChange}
            onSortChange={handlers.sortChange}
            cities={uniqueCities}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />

          {/* External events loading indicator */}
          {isLoadingExternal && (
            <LoadingSpinner message="Зареждане на външни събития..." variant="inline" />
          )}

          {/* External events error message */}
          {externalError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
              <strong>Внимание:</strong> Не успяхме да заредим външни събития. Моля, опитайте отново по-късно.
            </div>
          )}

          <EventList events={paginatedEvents} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlers.pageChange}
            onItemsPerPageChange={handlers.itemsPerPageChange}
          />
        </>
      )}

      {/* Create Event Modal - Only render ProtectedRoute when modal is open */}
      {isCreateModalOpen && (
        <ProtectedRoute>
          <CreateEventModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            onEventCreated={eventCreatedHandler}
          />
        </ProtectedRoute>
      )}
    </section>
  );
}
