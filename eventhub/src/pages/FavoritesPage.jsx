import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { useFavorites } from "@/hooks/useFavorites";
import { Star } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { EventItem } from "@/components/events/EventItem";
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

export function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const { events, isLoading: isLoadingEvents, error: eventsError, fetchEvents } = useEvents(true);
  const { favorites, isLoading: isLoadingFavorites } = useFavorites();

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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Filter events to show only favorites
  const favoriteEvents = useMemo(() => {
    if (!isAuthenticated || !user || !favorites.length || !events.length) {
      return [];
    }

    // Get event IDs from favorites
    const favoriteEventIds = favorites.map(fav => String(fav.eventId));
    
    // Filter events that are in favorites
    return events.filter(event => favoriteEventIds.includes(String(event.id)));
  }, [events, favorites, user, isAuthenticated]);

  // Compute unique cities from favoriteEvents
  const uniqueCities = useMemo(() => {
    return [...new Set(favoriteEvents.map(e => e.location?.city).filter(Boolean))].sort();
  }, [favoriteEvents]);

  // Handlers for sorting
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
    setCurrentPage(1);
  }, []);

  const pageChangeHandler = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const itemsPerPageChangeHandler = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Apply all filters and sorting using useMemo for optimization
  // Pipeline: favoriteEvents → search → city → category → price → sort
  const filteredAndSortedEvents = useMemo(() => {
    // Step 1: Apply search filter
    let filtered = favoriteEvents.filter(event => {
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
  }, [favoriteEvents, searchQuery, selectedCity, selectedCategory, selectedPrice, sortBy, sortOrder]);

  // Calculate pagination
  const totalItems = filteredAndSortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, endIndex);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);

  // Handle edit - navigate to events page where edit functionality is available
  // eslint-disable-next-line no-unused-vars
  function handleEdit(eventId) {
    // Edit functionality is available in EventList component
  }

  // Handle delete - no action needed
  // eslint-disable-next-line no-unused-vars
  function handleDelete(event) {
    // After deletion from favorites, favoriteEvents will automatically update via useFavorites hook
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Моля, влезте в профила си, за да видите вашите любими събития.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingEvents || isLoadingFavorites) {
    return <LoadingSpinner message="Зареждане на любимите събития..." />;
  }

  // Error state
  if (eventsError) {
    return <ErrorMessage message={eventsError} onRetry={fetchEvents} />;
  }

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      {/* Header with title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
          <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
          Любими събития
        </h2>
      </div>

      {/* Events List or Empty State */}
      {favoriteEvents.length === 0 ? (
        <EmptyState
          title="Няма любими събития"
          message="Все още нямате добавени любими събития. Разгледайте събитията и добавете тези, които ви интересуват!"
          icon="⭐"
        />
      ) : (
        <>
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={searchChangeHandler}
          />

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
                      className="w-full min-w-0 h-full flex opacity-0 animate-fade-in-up"
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
    </section>
  );
}

