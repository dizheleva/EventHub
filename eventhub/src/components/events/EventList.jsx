import { useMemo } from "react";
import { normalizeEvent } from "@/utils/eventHelpers";
import EventCardSkeleton from "./EventCard/EventCardSkeleton";
import EventItem from "./EventCard/EventCard";

export default function EventList({ events = [], isLoading = false }) {
  // Normalize events once
  const normalizedEvents = useMemo(
    () => events.map(event => normalizeEvent(event)),
    [events]
  );

  // Loading state - show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-full min-w-0 h-full flex">
            <EventCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Empty state - no events to display
  if (normalizedEvents.length === 0) {
    return null; // Empty state is handled by parent
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {normalizedEvents.map((normalizedEvent, index) => (
        <div 
          key={normalizedEvent.id} 
          className="w-full min-w-0 h-full flex opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <EventItem normalizedEvent={normalizedEvent} originalEvent={events[index]} />
        </div>
      ))}
    </div>
  );
}
