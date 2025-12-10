import { useState, useMemo, useCallback } from "react";
import { applyFilters } from "../utils/filterEvents";
import { sortEvents } from "../utils/eventHelpers";

/**
 * Custom hook for managing event filters, sorting, and pagination
 * @param {Array} events - Events array
 * @returns {Object} Filter state and handlers
 */
export function useEventFilters(events = []) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
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
  
  // Compute unique cities from events
  // Format: "Град, Адрес" - градът е първата част
  const uniqueCities = useMemo(() => {
    const cities = new Set();
    events.forEach(event => {
      if (event.location) {
        if (event.location.toLowerCase().includes('онлайн')) {
          return; // Skip online events
        }
        const parts = event.location.split(',').map(p => p.trim());
        if (parts.length >= 1) {
          // Първата част е градът
          cities.add(parts[0]);
        }
      }
    });
    return Array.from(cities).sort();
  }, [events]);
  
  // Apply all filters using the filter pipeline
  const filteredEvents = useMemo(() => {
    const filters = {
      searchQuery,
      city: selectedCity,
      category: selectedCategory,
      price: selectedPrice,
      date: selectedDate
    };
    
    return applyFilters(events, filters);
  }, [events, searchQuery, selectedCity, selectedCategory, selectedPrice, selectedDate]);
  
  // Apply sorting
  const sortedEvents = useMemo(() => {
    return sortEvents(filteredEvents, sortBy, sortOrder);
  }, [filteredEvents, sortBy, sortOrder]);
  
  // Calculate pagination
  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedEvents.slice(startIndex, endIndex);
  }, [sortedEvents, currentPage, itemsPerPage]);
  
  // Function to clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCategory("");
    setSelectedPrice("");
    setSelectedDate("");
    setSortBy("date");
    setSortOrder("asc");
    setCurrentPage(1);
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
    setCurrentPage(1);
  }, []);
  
  const sortChangeHandler = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  }, []);
  
  const pageChangeHandler = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  
  const itemsPerPageChangeHandler = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);
  
  return {
    // Filtered and sorted data
    filteredEvents: sortedEvents,
    paginatedEvents,
    uniqueCities,
    
    // Pagination info
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Filter values
    filters: {
      city: selectedCity,
      category: selectedCategory,
      price: selectedPrice,
      date: selectedDate,
      searchQuery,
      sortBy,
      sortOrder
    },
    
    // Handlers
    handlers: {
      searchChange: searchChangeHandler,
      filtersChange: filtersChangeHandler,
      sortChange: sortChangeHandler,
      pageChange: pageChangeHandler,
      itemsPerPageChange: itemsPerPageChangeHandler,
      clearAllFilters
    }
  };
}

