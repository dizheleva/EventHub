import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { Sorting } from "@/components/common/Sorting";
import { Pagination } from "@/components/common/Pagination";
import { SearchBar } from "@/components/common/SearchBar";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EventItem } from "./EventItem";
import { EventCardSkeleton } from "./EventCardSkeleton";
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
      // For normalized events, use startDate if date is not available
      aValue = aValue || a.startDate;
      bValue = bValue || b.startDate;
      // Compare dates
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    } else if (sortByField === "location") {
      // For location, compare city first, then address
      const aLocation = a.location?.city || a.location?.address || "";
      const bLocation = b.location?.city || b.location?.address || "";
      aValue = aLocation.toString().toLowerCase();
      bValue = bLocation.toString().toLowerCase();
    } else {
      // Compare strings (title, etc.)
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
  const { 
    events, 
    externalEvents, 
    isLoading, 
    isLoadingExternal,
    error, 
    externalError,
    fetchEvents, 
    fetchExternalEvents,
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useEvents(true);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Source filter state (all, local, external)
  const [sourceFilter, setSourceFilter] = useState("all");
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  
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
  
  // Track if we've already fetched on mount
  const hasFetchedOnMount = useRef(false);

  useEffect(() => {
    fetchEvents();
    // Always fetch external events on mount (includes Varna scraper even without AllEvents API key)
    if (!hasFetchedOnMount.current) {
      fetchExternalEvents({ city: selectedCity || undefined });
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
      if (selectedCity) {
        fetchExternalEvents({ city: selectedCity });
      } else {
        fetchExternalEvents(); // Fetch all Bulgaria events (includes Varna scraper)
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]); // Only depend on selectedCity, not fetchExternalEvents

  // Authorization check before opening edit modal
  // Only owners can edit their events - prevent unauthorized access
  const editClickHandler = useCallback(async (eventId) => {
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
  }, [isAuthenticated, events, user, showToast]);

  const closeEditModalHandler = useCallback(() => {
    setShowEditModal(false);
    setSelectedEventId(null);
  }, []);

  const eventUpdatedHandler = useCallback(async (updatedEvent) => {
    try {
      // updateEvent already handles optimistic update
      await updateEvent(updatedEvent.id, updatedEvent);
      closeEditModalHandler();
      showToast("success", "Събитието беше обновено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при обновяване на събитие");
    }
  }, [updateEvent, closeEditModalHandler, showToast]);

  // Authorization check before opening delete modal
  // Only owners can delete their events - prevent unauthorized access
  const deleteClickHandler = useCallback((event) => {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Check if user is the author (creator) - authorization check
    // Support both creatorId (new) and userId (legacy) for backward compatibility
    const eventCreatorId = event.creatorId;
    if (eventCreatorId !== user?.id) {
      // User is NOT the owner - prevent unauthorized access
      showToast("error", "Нямате права да изтривате това събитие");
      return; // Prevent opening modal for non-owners
    }

    // User is authorized - open delete modal
    setDeletingEventId(event.id);
    setIsDeleteModalOpen(true);
  }, [isAuthenticated, user, showToast]);

  const closeDeleteModalHandler = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingEventId(null);
  }, []);

  const eventDeletedHandler = useCallback(() => {
    // This is called after successful deletion in DeleteEventModal
    // No additional action needed as deleteEvent hook handles everything
  }, []);

  const eventDeleteErrorHandler = useCallback((eventId, error) => {
    // Error handling is done in deleteEvent hook (revert state)
    // Show additional toast if needed
    showToast("error", error.message || "Възникна грешка при изтриване на събитие. Събитието беше възстановено.");
  }, [showToast]);

  const openCreateModalHandler = useCallback(() => {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }
    setShowCreateModal(true);
  }, [isAuthenticated, showToast]);

  const closeCreateModalHandler = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const eventCreatedHandler = useCallback(async (eventData) => {
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
  }, [createEvent, closeCreateModalHandler, showToast]);

  const pageChangeHandler = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const itemsPerPageChangeHandler = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const sortChangeHandler = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, []);

  // Handlers that reset pagination
  const searchChangeHandler = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const filtersChangeHandler = useCallback((updatedFilters) => {
    setSelectedCity(updatedFilters.city || "");
    setSelectedCategory(updatedFilters.category || "");
    setSelectedPrice(updatedFilters.price || "");
    setSelectedDate(updatedFilters.date || "");
    if (updatedFilters.source !== undefined) {
      setSourceFilter(updatedFilters.source || "all");
    }
    setCurrentPage(1);
  }, []);

  // Compute unique cities safely (from both internal and external events based on source filter)
  const uniqueCities = useMemo(() => {
    let eventsToUse = [];
    if (sourceFilter === "local") {
      eventsToUse = events;
    } else if (sourceFilter === "external") {
      eventsToUse = externalEvents;
    } else {
      eventsToUse = [...events, ...externalEvents];
    }
    return [...new Set(eventsToUse.map(e => e.location?.city).filter(Boolean))].sort();
  }, [events, externalEvents, sourceFilter]);

  // Apply all filters and sorting using useMemo for optimization
  // Pipeline: source filter → merge events → filter past events → search → city → category → price → sort
  const filteredAndSortedEvents = useMemo(() => {
    // Step 0: Filter by source (all, local, external)
    let displayedEvents = [];
    if (sourceFilter === "local") {
      displayedEvents = events;
    } else if (sourceFilter === "external") {
      displayedEvents = externalEvents;
    } else {
      // sourceFilter === "all"
      displayedEvents = [...events, ...externalEvents];
    }
    
    // Step 0.5: Filter out past events (where both startDate and endDate are in the past)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    const futureEvents = displayedEvents.filter(event => {
      if (!event.startDate) {
        return false; // Skip events without start date
      }
      
      try {
        const startDate = new Date(event.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Check if start date is in the past
        if (startDate < now) {
          // If start date is past, check end date
          if (event.endDate) {
            const endDate = new Date(event.endDate);
            endDate.setHours(0, 0, 0, 0);
            
            // If end date is also in the past, skip this event
            if (endDate < now) {
              return false;
            }
          } else {
            // No end date, but start date is past - skip
            return false;
          }
        }
        
        // Event is valid (either start date is in future, or end date is in future)
        return true;
      } catch (error) {
        // Skip events with invalid dates
        return false;
      }
    });
    
    // Step 0.6: Use filtered future events
    const allEvents = futureEvents;

    // Step 1: Apply search filter
    let filtered = allEvents.filter(event => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        event.title?.toLowerCase().includes(query) ||
        event.location?.address?.toLowerCase().includes(query) ||
        event.location?.city?.toLowerCase().includes(query)
      );
    });

    // Step 2: Apply city filter (exact match)
    if (selectedCity) {
      filtered = filtered.filter(event => event.location?.city === selectedCity);
    }

    // Step 3: Apply category filter (exact match)
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Step 4: Apply price filter
    if (selectedPrice === "free") {
      filtered = filtered.filter(event => {
        // Handle both string and numeric prices
        if (typeof event.price === "number") {
          return event.price === 0;
        }
        const priceValue = event.price || "";
        const priceLower = String(priceValue).toLowerCase();
        return (
          priceValue === "Безплатно" ||
          priceLower.includes("безплат") ||
          priceLower.includes("free") ||
          priceValue === 0
        );
      });
    }

    // Step 5: Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(event => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        const filterDate = new Date(selectedDate);
        
        // Compare only date part (ignore time)
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
        
        return eventDateOnly.getTime() === filterDateOnly.getTime();
      });
    }

    // Step 6: Apply sorting
    filtered = sortEvents(filtered, sortBy, sortOrder);

    return filtered;
  }, [events, externalEvents, sourceFilter, searchQuery, selectedCity, selectedCategory, selectedPrice, selectedDate, sortBy, sortOrder]);

  // Calculate pagination
  const totalItems = filteredAndSortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, endIndex);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);


  // Error state for internal events
  if (error) return <ErrorMessage message={error} onRetry={fetchEvents} />;

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-full min-w-0 h-full">
              <EventCardSkeleton />
            </div>
          ))}
        </div>
        {isLoadingExternal && (
          <div className="text-center mt-4 text-gray-600">
            Зареждане на външни събития...
          </div>
        )}
      </div>
    );
  }

  // Determine if we should show empty state
  const hasLocalEvents = events.length > 0;
  const hasExternalEvents = externalEvents.length > 0;
  const hasAnyEvents = hasLocalEvents || hasExternalEvents;
  
  // Check if current filter shows any events
  const showEmptyState = !hasAnyEvents || filteredAndSortedEvents.length === 0;

  return (
    <>
      {showEmptyState ? (
        <EmptyState
          title="Няма събития"
          message={
            !hasAnyEvents
              ? "Все още няма добавени събития. Създай първото!"
              : sourceFilter === "local"
              ? "Няма потребителски събития по избраните филтри."
              : sourceFilter === "external"
              ? "Няма външни събития по избраните филтри."
              : "Няма събития по избраните филтри. Опитай с други критерии!"
          }
          icon="🎈"
          action={
            isAuthenticated && !hasLocalEvents ? (
              <button
                onClick={openCreateModalHandler}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all mx-auto"
              >
                <Plus className="w-5 h-5" />
                Добави събитие
              </button>
            ) : null
          }
        />
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
              filters={{ source: sourceFilter, city: selectedCity, category: selectedCategory, price: selectedPrice, date: selectedDate }}
              onChange={filtersChangeHandler}
              cities={uniqueCities}
            />
          </div>

          {/* External events loading indicator */}
          {isLoadingExternal && (
            <div className="text-center py-4 text-gray-600 mb-4">
              <LoadingSpinner message="Зареждане на външни събития..." />
            </div>
          )}

          {/* External events error message */}
          {externalError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
              <strong>Внимание:</strong> Не успяхме да заредим външни събития.
              <br />
              <span className="text-xs text-yellow-700 mt-1 block">{externalError}</span>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-yellow-700 hover:text-yellow-900">Детайли за грешката</summary>
                <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto">{externalError}</pre>
              </details>
            </div>
          )}


          {filteredAndSortedEvents.length === 0 ? (
            <EmptyState
              title="Няма събития"
              message="Няма събития по избраните филтри. Опитай с други критерии!"
              icon="🔍"
            />
          ) : (
            <>
              <div className="px-4 py-6">
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                >
                  {paginatedEvents.map((event, index) => (
                    <div 
                      key={event.id} 
                      className="w-full min-w-0 h-full flex opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
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

      {/* Edit Modal - Only render ProtectedRoute when modal is open */}
      {showEditModal && (
        <ProtectedRoute>
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
        </ProtectedRoute>
      )}

      {/* Delete Modal - Only render ProtectedRoute when modal is open */}
      {isDeleteModalOpen && (
        <ProtectedRoute>
          <DeleteEventModal
            eventId={deletingEventId}
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModalHandler}
            onDeleted={eventDeletedHandler}
            onError={eventDeleteErrorHandler}
            deleteEvent={deleteEvent}
          />
        </ProtectedRoute>
      )}

      {/* Create Event Modal - Only render ProtectedRoute when modal is open */}
      {showCreateModal && (
        <ProtectedRoute>
          <CreateEventModal
            isOpen={showCreateModal}
            onClose={closeCreateModalHandler}
            onEventCreated={eventCreatedHandler}
          />
        </ProtectedRoute>
      )}
    </>
  );
}
