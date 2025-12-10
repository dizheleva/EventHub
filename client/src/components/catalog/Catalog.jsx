import { useMemo, useState } from "react";
import EventCard from "../event-card/EventCard";
import EventCardSkeleton from "../event-card/EventCardSkeleton";
import useRequest from "../../hooks/useRequest";
import { useEventFilters } from "../../hooks/useEventFilters";
import { useUserContext } from "../../contexts/UserContext";
import SearchBar from "../common/navigation/SearchBar";
import EventsFiltersBar from "../events/Filters/EventsFilters";
import Pagination from "../common/navigation/Pagination";
import AddEventButton from "../events/AddEventButton";
import CreateEventModal from "../events/CreateEventModal";

export default function Catalog() {
    const { isAuthenticated } = useUserContext();
    const { data: events, setData: setEvents, isLoading: isLoadingEvents } = useRequest('/data/events', []);
    const { data: users, isLoading: isLoadingUsers } = useRequest('/data/users', []);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Use event filters hook
    const {
        paginatedEvents,
        uniqueCities,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        filters,
        handlers
    } = useEventFilters(events || []);

    // Create a map of user IDs to user data
    const usersMap = useMemo(() => {
        const map = {};
        if (Array.isArray(users)) {
            users.forEach(user => {
                if (user && user._id) {
                    map[user._id] = user;
                }
            });
        }
        return map;
    }, [users]);

    // Enrich paginated events with author information
    const eventsWithAuthors = useMemo(() => {
        if (!Array.isArray(paginatedEvents)) {
            return [];
        }
        return paginatedEvents.map(event => ({
            ...event,
            author: event._ownerId ? (usersMap[event._ownerId] || null) : null
        }));
    }, [paginatedEvents, usersMap]);

    const hasEvents = Array.isArray(events) && events.length > 0;
    const hasFilteredEvents = eventsWithAuthors.length > 0;

    const isLoading = isLoadingEvents || isLoadingUsers;

    return (
        <section className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Събития</h1>

            {/* Add Event Button */}
            {isAuthenticated && (
                <AddEventButton onClick={() => setShowCreateModal(true)} variant="inline" />
            )}

            {/* Search Bar */}
            <SearchBar
                value={filters.searchQuery}
                onChange={handlers.searchChange}
            />

            {/* Filters and Sorting */}
            <EventsFiltersBar
                filters={{ city: filters.city, category: filters.category, price: filters.price, date: filters.date }}
                onFiltersChange={handlers.filtersChange}
                onSortChange={handlers.sortChange}
                cities={uniqueCities}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
            />

            {/* Events Grid - Show skeleton while loading, real cards when loaded */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="w-full min-w-0 h-full flex">
                            <EventCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : hasEvents && hasFilteredEvents ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventsWithAuthors.map((event, index) => (
                            <div 
                                key={event._id} 
                                className="w-full min-w-0 h-full flex opacity-0 animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <EventCard {...event} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onPageChange={handlers.pageChange}
                            onItemsPerPageChange={handlers.itemsPerPageChange}
                        />
                    )}
                </>
            ) : hasEvents ? (
                <div className="text-center py-12">
                    <h3 className="text-2xl text-gray-500 font-medium">Няма събития по този критерий</h3>
                    <button
                        onClick={handlers.clearAllFilters}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Изчисти филтрите
                    </button>
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-2xl text-gray-500 font-medium">Все още няма добавени събития</h3>
                    {isAuthenticated && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-color transition-all"
                        >
                            Създай първото събитие
                        </button>
                    )}
                </div>
            )}

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateEventModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onEventCreated={(newEvent) => {
                        setEvents(prev => Array.isArray(prev) ? [...prev, newEvent] : [newEvent]);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </section>
    );
}

