import { memo, useState, useEffect } from "react";
import { Edit, Trash2, Calendar, Star, Heart, MapPin, Clock, Tag, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCategoryDisplay } from "@/utils/categories";
import { normalizeEvent, formatEventPrice, formatDuration } from "@/utils/eventHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { useInterested } from "@/hooks/useInterested";
import { getUserLikes } from "@/api/userLikesApi";
import { API_BASE_URL } from "@/config/api";
import { getUserDisplayName } from "@/utils/userHelpers";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/contexts/ToastContext";

const USERS_API_URL = `${API_BASE_URL}/users`;

export const EventItem = memo(function EventItem({ event, onEdit, onDelete, authorLikesCount: externalAuthorLikesCount }) {
  const { user, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Normalize event to new format
  const normalizedEvent = normalizeEvent(event);
  
  // Check if event is external
  const isExternal = event.isExternal === true;
  
  // Check if event is past (both startDate and endDate are in the past)
  const isPastEvent = (() => {
    if (!normalizedEvent.startDate) return false;
    
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const startDate = new Date(normalizedEvent.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Check if start date is in the past
      if (startDate < now) {
        // If start date is past, check end date
        if (normalizedEvent.endDate) {
          const endDate = new Date(normalizedEvent.endDate);
          endDate.setHours(0, 0, 0, 0);
          
          // If end date is also in the past, event is past
          return endDate < now;
        } else {
          // No end date, but start date is past - event is past
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  })();
  
  // Authorization check
  const eventCreatorId = normalizedEvent.creatorId;
  const isOwner = isAuthenticated && user && eventCreatorId === user.id && !isPastEvent;
  
  // Format dates - check if time is meaningful (not midnight)
  const hasTime = (dateString) => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      
      // Check if time is midnight in local timezone
      // Dates created from YYYY-MM-DD format (date-only) will have 00:00:00 in local time
      const localHours = date.getHours();
      const localMinutes = date.getMinutes();
      const localSeconds = date.getSeconds();
      const localMilliseconds = date.getMilliseconds();
      
      // If all time components are 0 in local time, treat it as date-only
      // This handles dates scraped from Varna site which only have date (DD.MM.YYYY)
      if (localHours === 0 && localMinutes === 0 && localSeconds === 0 && localMilliseconds === 0) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const formatDateTime = (dateString, isExternalEvent = false) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      
      // For external events, always show only date (no time)
      if (isExternalEvent) {
        return date.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
      
      // For local events, check if time is present
      if (hasTime(dateString)) {
        // Format with date and time
        return date.toLocaleString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } else {
        // Format only date (no time)
        return date.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
    } catch {
      return dateString;
    }
  };
  
  const startDateTime = formatDateTime(normalizedEvent.startDate, isExternal);
  const endDateTime = normalizedEvent.endDate ? formatDateTime(normalizedEvent.endDate, isExternal) : null;
  const duration = formatDuration(normalizedEvent.durationMinutes);
  
  // Price
  const priceString = formatEventPrice(normalizedEvent.price);
  
  // Category
  const category = getCategoryDisplay(normalizedEvent.category);
  
  // Get interests count
  const { interestsCount } = useInterested(event.id);
  
  // Check if favorite
  const eventIsFavorite = isFavorite(event.id);
  
  // Handle favorite toggle
  async function handleToggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast("error", "Трябва да сте влезли в профила си, за да добавяте любими");
      return;
    }
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      const wasAdded = await toggleFavorite(event.id);
      showToast("success", wasAdded ? "Събитието беше добавено в любими" : "Събитието беше премахнато от любими");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при промяна на любимото");
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  // Author data
  const [authorName, setAuthorName] = useState(null);
  const [authorLikesCount, setAuthorLikesCount] = useState(externalAuthorLikesCount ?? 0);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  // Load author name
  useEffect(() => {
    if (eventCreatorId) {
      setIsLoadingAuthor(true);
      fetch(`${USERS_API_URL}/${eventCreatorId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch author");
          }
          return res.json();
        })
        .then(userData => {
          const username = getUserDisplayName(userData, "Неизвестен");
          setAuthorName(username);
        })
        .catch(err => {
          console.error("Error loading author:", err);
          setAuthorName("Неизвестен");
        })
        .finally(() => setIsLoadingAuthor(false));
    }
  }, [eventCreatorId]);

  // Load or update author likes
  useEffect(() => {
    if (eventCreatorId) {
      if (externalAuthorLikesCount !== undefined) {
        setAuthorLikesCount(externalAuthorLikesCount);
      } else {
        getUserLikes(eventCreatorId)
          .then(likes => setAuthorLikesCount(likes.length))
          .catch(err => {
            console.error("Error loading author likes:", err);
            setAuthorLikesCount(0);
          });
      }
    }
  }, [eventCreatorId, externalAuthorLikesCount]);

  // For external events, link to their website URL instead of detail page
  const externalUrl = isExternal && normalizedEvent.websiteUrl ? normalizedEvent.websiteUrl : null;

  // Handle click on event card
  const handleEventClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('a, button, [role="button"]')) {
      return;
    }
    
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <div
      onClick={handleEventClick}
      className="block w-full bg-white rounded-2xl shadow-soft hover:shadow-color transition-all overflow-hidden group h-full flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {normalizedEvent.imageUrl ? (
          <img
            src={normalizedEvent.imageUrl}
            alt={normalizedEvent.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-primary/60" />
          </div>
        )}
        {/* Favorite button */}
        {isAuthenticated && (
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
            aria-label={eventIsFavorite ? "Премахни от любими" : "Добави в любими"}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                eventIsFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
              }`}
            />
          </button>
        )}
        {/* Interests badge - долен десен ъгъл */}
        {interestsCount > 0 && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md flex items-center gap-1.5 z-10">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-gray-900">
              {interestsCount} {interestsCount === 1 ? "има интерес" : "имат интерес"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            {category}
          </span>
          <div className="flex items-center gap-2">
            {/* Past Event Badge */}
            {isPastEvent && (
              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                Свършило
              </span>
            )}
            {/* External Event Badge */}
            {event.isExternal === true && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                Външно събитие
              </span>
            )}
            {/* Online Badge */}
            {normalizedEvent.isOnline && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Онлайн
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {normalizedEvent.title}
        </h3>

        {/* City - под заглавието */}
        {normalizedEvent.location?.city && (
          <div className="mb-3">
            <span className="text-sm text-gray-600 font-medium">
              {normalizedEvent.location.city}
            </span>
          </div>
        )}

        {/* Начална и крайна дата и час */}
        {startDateTime && (
          <div className="mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">Начало: {startDateTime}</span>
            </div>
            {endDateTime && endDateTime !== startDateTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                <span>Край: {endDateTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Продължителност */}
        {duration && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Clock className="w-4 h-4" />
            <span>Продължителност: {duration}</span>
          </div>
        )}

        {/* Останалите подробности за място */}
        {!normalizedEvent.isOnline && normalizedEvent.location?.address && (
          <div className="mb-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{normalizedEvent.location.address}</span>
            </div>
          </div>
        )}

        {/* Онлайн локация */}
        {normalizedEvent.isOnline && (
          <div className="mb-3 text-sm text-gray-600">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
              Онлайн събитие
            </span>
          </div>
        )}

        {/* Цена - не се показва за външни събития */}
        {!isExternal && (
          <div className="mb-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              normalizedEvent.price === 0 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {priceString}
            </span>
          </div>
        )}

        {/* Автор - mt-auto за да изтласка останалото надолу */}
        {!isExternal && eventCreatorId && (
          <div className="pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Автор:</span>
              <Link
                to={`/profile/${eventCreatorId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1.5"
              >
                {isLoadingAuthor ? (
                  <span className="text-gray-400">Зареждане...</span>
                ) : (
                  <>
                    <span>{authorName || "Неизвестен"}</span>
                    {authorLikesCount > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Heart className="w-3 h-3 fill-yellow-600" />
                        <span className="text-xs">{authorLikesCount}</span>
                      </span>
                    )}
                  </>
                )}
              </Link>
            </div>
          </div>
        )}

        {/* Owner Actions - only for local events */}
        {isOwner && !isExternal && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(event);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors"
              aria-label="Редактирай събитие"
            >
              <Edit className="w-4 h-4" />
              Редактирай
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(event);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
              aria-label="Изтрий събитие"
            >
              <Trash2 className="w-4 h-4" />
              Изтрий
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
