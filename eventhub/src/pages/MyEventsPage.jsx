import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarX } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useToast } from "@/contexts/ToastContext";
import { EventItem } from "@/components/events/EventItem";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { SearchBar } from "@/components/common/SearchBar";
import { Sorting } from "@/components/common/Sorting";
import { EventsFilters } from "@/components/events/EventsFilters";
import { Pagination } from "@/components/common/Pagination";

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

export function MyEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { events, isLoading, error, fetchEvents, createEvent } = useEvents(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Compute unique cities from myEvents
  const uniqueCities = useMemo(() => {
    return [...new Set(myEvents.map(e => e.city).filter(Boolean))].sort();
  }, [myEvents]);

  // Handlers for sorting
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

  function pageChangeHandler(newPage) {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function itemsPerPageChangeHandler(newItemsPerPage) {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }

  // Apply all filters and sorting using useMemo for optimization
  // Pipeline: myEvents → search → city → category → price → sort
  const filteredAndSortedEvents = useMemo(() => {
    // Step 1: Apply search filter
    let filtered = myEvents.filter(event => {
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
  }, [myEvents, searchQuery, selectedCity, selectedCategory, selectedPrice, sortBy, sortOrder]);

  // Calculate pagination
  const totalItems = filteredAndSortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, endIndex);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);

  // Handle opening create modal
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

  // Handle event created - refresh the list
  async function eventCreatedHandler(eventData) {
    try {
      // createEvent already handles optimistic update
      await createEvent(eventData);
      closeCreateModalHandler();
      showToast("success", "Събитието е създадено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при създаване на събитие");
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
      {/* Header with title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 text-center">
          Моите събития
        </h2>
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
        <>
          {/* Search Bar with Create Button */}
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

          {/* Sorting and Filters */}
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

          {/* Events Grid or Empty Filter State */}
          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Няма събития по този критерий</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-6">
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                >
                  {paginatedEvents.map((event, index) => (
                    <div 
                      key={event.id} 
                      className="w-full min-w-0 h-full opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventItem
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
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

