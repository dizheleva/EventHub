import { useState, useMemo, useCallback } from "react";
import { applyFilters } from "@/utils/filterEvents";
import { sortEvents } from "@/utils/eventHelpers";

/**
 * Custom hook for managing event filters, sorting, and pagination
 * @param {Array} events - Local events array
 * @param {Array} externalEvents - External events array
 * @returns {Object} Filter state and handlers
 */
export function useEventFilters(events = [], externalEvents = []) {
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
  
  // Apply all filters using the filter pipeline
  const filteredEvents = useMemo(() => {
    const filters = {
      sourceFilter,
      searchQuery,
      city: selectedCity,
      category: selectedCategory,
      price: selectedPrice,
      date: selectedDate
    };
    
    return applyFilters(events, externalEvents, filters);
  }, [events, externalEvents, sourceFilter, searchQuery, selectedCity, selectedCategory, selectedPrice, selectedDate]);
  
  // Apply sorting
  const sortedEvents = useMemo(() => {
    return sortEvents(filteredEvents, sortBy, sortOrder);
  }, [filteredEvents, sortBy, sortOrder]);
  
  // Calculate pagination
  const totalItems = sortedEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedEvents.slice(startIndex, endIndex);
  }, [sortedEvents, currentPage, itemsPerPage]);
  
  // Function to clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSourceFilter("all");
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
    if (updatedFilters.source !== undefined) {
      setSourceFilter(updatedFilters.source || "all");
    }
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
      source: sourceFilter,
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

