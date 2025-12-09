import { useMemo, useCallback, useState } from "react";
import { Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isEventPast } from "@/utils/dateHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { useInterested } from "@/hooks/useInterested";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/useToast";
import { useAuthorData } from "@/hooks/useAuthorData";
import { useEventDates } from "@/hooks/useEventDates";
import { useEventImage } from "@/hooks/useEventImage";
import EventImage from "./EventImage";
import EventBadges from "./EventBadges";
import EventAuthor from "./EventAuthor";
import EventFooter from "./EventFooter";

export default function EventItem({ 
  normalizedEvent, 
  originalEvent,
  authorLikesCount: externalAuthorLikesCount 
}) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Memoized values
  const isExternal = useMemo(() => originalEvent?.isExternal === true, [originalEvent?.isExternal]);
  const isPastEvent = useMemo(() => isEventPast(normalizedEvent), [normalizedEvent]);
  
  // Combined memoized event metadata
  const eventMetadata = useMemo(() => ({
    eventCreatorId: normalizedEvent.creatorId,
    eventIsFavorite: isFavorite(normalizedEvent.id)
  }), [normalizedEvent.creatorId, isFavorite, normalizedEvent.id]);
  
  // Custom hooks
  const { authorName, authorLikesCount, isLoadingAuthor } = useAuthorData(
    eventMetadata.eventCreatorId,
    externalAuthorLikesCount
  );
  
  const { startDateTime, endDateTime } = useEventDates(normalizedEvent, isExternal);
  
  const { imageLoading, imageError, onLoad, onError } = useEventImage(
    normalizedEvent.imageUrl,
    normalizedEvent.id
  );
  
  // Get interests count
  const { interestsCount } = useInterested(normalizedEvent.id);
  
  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast("error", "Трябва да сте влезли в профила си, за да добавяте любими");
      return;
    }
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      const wasAdded = await toggleFavorite(normalizedEvent.id);
      showToast("success", wasAdded ? "Събитието беше добавено в любими" : "Събитието беше премахнато от любими");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при промяна на любимото");
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [isAuthenticated, isTogglingFavorite, toggleFavorite, normalizedEvent.id, showToast]);

  // For external events, link to their website URL instead of detail page
  const externalUrl = useMemo(
    () => (isExternal && normalizedEvent.websiteUrl ? normalizedEvent.websiteUrl : null),
    [isExternal, normalizedEvent.websiteUrl]
  );

  // Handle click on event card
  const handleEventClick = useCallback(() => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/events/${normalizedEvent.id}`);
    }
  }, [externalUrl, normalizedEvent.id, navigate]);

  // Favorite button JSX
  const favoriteButton = useMemo(() => {
    if (!isAuthenticated) return null;
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isTogglingFavorite}
        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
        aria-label={eventMetadata.eventIsFavorite ? "Премахни от любими" : "Добави в любими"}
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            eventMetadata.eventIsFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
          }`}
        />
      </button>
    );
  }, [isAuthenticated, handleToggleFavorite, isTogglingFavorite, eventMetadata.eventIsFavorite]);

  // Interests badge JSX
  const interestsBadge = useMemo(() => {
    if (interestsCount <= 0) return null;
    return (
      <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md flex items-center gap-1.5 z-10">
        <Heart className="w-4 h-4 text-primary fill-primary" />
        <span className="text-sm font-semibold text-gray-900">
          {interestsCount} {interestsCount === 1 ? "има интерес" : "имат интерес"}
        </span>
      </div>
    );
  }, [interestsCount]);

  return (
    <div
      onClick={handleEventClick}
      className="block w-full bg-white rounded-2xl shadow-soft hover:shadow-color transition-all overflow-hidden group h-full flex flex-col cursor-pointer [&>*]:pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto"
    >
      <EventImage
        imageUrl={normalizedEvent.imageUrl}
        title={normalizedEvent.title}
        imageLoading={imageLoading}
        imageError={imageError}
        onLoad={onLoad}
        onError={onError}
        favoriteButton={favoriteButton}
        interestsBadge={interestsBadge}
      />

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <EventBadges
          category={normalizedEvent.category}
          isPastEvent={isPastEvent}
          isExternal={isExternal}
          isOnline={normalizedEvent.isOnline}
        />

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {normalizedEvent.title}
        </h3>

        <EventFooter
          startDateTime={startDateTime}
          endDateTime={endDateTime}
          city={normalizedEvent.location?.city}
          address={normalizedEvent.location?.address}
          isOnline={normalizedEvent.isOnline}
          price={normalizedEvent.price}
          isExternal={isExternal}
        />

        {/* Автор - само за локални събития */}
        {!isExternal && (
          <EventAuthor
            eventCreatorId={eventMetadata.eventCreatorId}
            authorName={authorName}
            authorLikesCount={authorLikesCount}
            isLoadingAuthor={isLoadingAuthor}
          />
        )}
      </div>
    </div>
  );
}
