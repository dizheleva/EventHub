import { memo, useState, useEffect } from "react";
import { Edit, Trash2, Calendar, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryDisplay } from "@/utils/categories";
import { formatPrice } from "@/utils/priceFormatter";
import { formatDate } from "@/utils/dateFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useInterested } from "@/hooks/useInterested";
import { getUserLikes } from "@/api/userLikesApi";
import { API_BASE_URL } from "@/config/api";
import { getUserDisplayName } from "@/utils/userHelpers";

const USERS_API_URL = `${API_BASE_URL}/users`;
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/contexts/ToastContext";

export const EventItem = memo(function EventItem({ event, onEdit, onDelete, authorLikesCount: externalAuthorLikesCount }) {
  const { user, isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Authorization check: Verify current user is the owner (creator) of this event
  // Support both creatorId (new) and userId (legacy) for backward compatibility
  // Only owners can see and use Edit/Delete buttons
  const eventCreatorId = event.creatorId || event.userId;
  const isOwner = isAuthenticated && user && eventCreatorId === user.id;
  const formattedDate = formatDate(event.date);
  const city = event.city || "";
  const category = event.category || "";
  const price = formatPrice(event.price || "Безплатно");
  const organizer = event.organizer || "";
  
  // Get interests count for this event
  const { interestsCount } = useInterested(event.id);
  
  // Check if this event is favorite
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
  const [authorName, setAuthorName] = useState(event.creatorName || null);
  const [authorLikesCount, setAuthorLikesCount] = useState(externalAuthorLikesCount ?? 0);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  // Load author name if creatorId exists
  useEffect(() => {
    if (eventCreatorId) {
      if (event.creatorName) {
        setAuthorName(event.creatorName);
      } else {
        setIsLoadingAuthor(true);
        fetch(`${USERS_API_URL}/${eventCreatorId}`)
          .then(res => {
            if (!res.ok) {
              throw new Error("Failed to fetch author");
            }
            return res.json();
          })
          .then(userData => {
            const username = userData.username || userData.name || userData.email?.split("@")[0] || "Неизвестен";
            setAuthorName(username);
          })
          .catch(err => {
            console.error("Error loading author:", err);
            setAuthorName("Неизвестен");
          })
          .finally(() => setIsLoadingAuthor(false));
      }
    }
  }, [eventCreatorId, event.creatorName]);

  // Load or update author likes
  useEffect(() => {
    if (eventCreatorId) {
      if (externalAuthorLikesCount !== undefined) {
        // Use external value if provided
        setAuthorLikesCount(externalAuthorLikesCount);
      } else {
        // Load from API if not provided
        getUserLikes(Number(eventCreatorId))
          .then(likes => {
            setAuthorLikesCount(likes.length);
          })
          .catch(err => {
            console.error("Error loading author likes:", err);
            setAuthorLikesCount(0);
          });
      }
    }
  }, [eventCreatorId, externalAuthorLikesCount]);

  return (
    <div className="relative w-full h-full min-w-0 p-8 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col group">
      {/* Favorite button - visible for authenticated users */}
      {isAuthenticated && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`p-2 rounded-lg transition-all bg-white/90 backdrop-blur-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
              eventIsFavorite
                ? "text-yellow-500 hover:bg-yellow-50 focus-visible:outline-yellow-500"
                : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 focus-visible:outline-yellow-500"
            } ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={eventIsFavorite ? "Премахни от любими" : "Добави в любими"}
          >
            <Star className={`w-5 h-5 ${eventIsFavorite ? "fill-yellow-500" : ""}`} />
          </button>
        </div>
      )}
      
      {/* Authorization: Edit/Delete buttons - ONLY visible to owner */}
      {/* For non-owners: buttons are completely hidden (no empty space) */}
      {isOwner && (
        <div className="absolute top-2 right-2 flex gap-2 z-10" style={{ right: isAuthenticated ? "3.5rem" : "0.5rem" }}>
          <button
            onClick={() => onEdit(event.id)}
            className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm focus-visible:outline-2 focus-visible:outline-yellow-500 focus-visible:outline-offset-2"
            aria-label="Редактирай събитие"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2"
            aria-label="Изтрий събитие"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="mb-4 flex-shrink-0 w-full min-w-0 relative">
        <Link 
          to={`/events/${event.id}`}
          className="block focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-lg w-full min-w-0"
        >
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
            />
          ) : (
            <div className="w-full h-48 min-w-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <Calendar className="w-16 h-16 text-primary/60" />
            </div>
          )}
        </Link>
        {/* Interests Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-2 bg-gradient-to-r from-primary to-secondary text-white text-base font-semibold rounded-lg flex items-center gap-1.5 shadow-lg">
          👁 {interestsCount}
        </div>
      </div>
      <Link 
        to={`/events/${event.id}`} 
        className="hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded focus-visible:outline-dashed"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex-shrink-0 cursor-pointer">{event.title}</h3>
      </Link>
      
      {/* City and Category - 📍 София | 🎭 Култура */}
      {(city || category) && (
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0 text-sm text-gray-700">
          {city && <span>📍 {city}</span>}
          {city && category && <span className="text-gray-400">|</span>}
          {category && <span>{getCategoryDisplay(category)}</span>}
        </div>
      )}

      {/* Date - 📅 22.03.2025 — Събота */}
      {formattedDate && (
        <div className="mb-3 flex-shrink-0 text-sm text-gray-600">
          📅 {formattedDate}
        </div>
      )}

      {/* Price - Цена: Безплатно */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl flex-shrink-0">💰</span>
          <span className="text-base text-gray-700">
            <span className="font-bold text-lg">Цена:</span>{" "}
            <span
              className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${
                price.toLowerCase().includes("безплатно") || price.toLowerCase().includes("безплатн")
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {price}
            </span>
          </span>
        </div>
      </div>

      {/* Organizer - Организатор: Национален театър */}
      {organizer && (
        <div className="mb-4 flex-shrink-0 text-sm text-gray-700">
          <span className="font-medium">Организатор:</span> {organizer}
        </div>
      )}

      {/* Author - Автор */}
      {eventCreatorId && (
        <div className="mb-4 flex-shrink-0 text-sm text-gray-700">
          <span className="font-medium">Автор:</span>{" "}
          {isLoadingAuthor ? (
            <span className="text-gray-400">Зареждане...</span>
          ) : (
            <>
              <Link
                to={`/profile/${eventCreatorId}`}
                className="text-primary hover:underline"
              >
                {authorName || "Неизвестен"}
              </Link>
              {/* Show heart icon and likes count only if there are likes */}
              {authorLikesCount > 0 && (
                <span className="inline-flex items-center gap-1 ml-1">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="text-red-500">{authorLikesCount}</span>
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* View Details Button */}
      <Link
        to={`/events/${event.id}`}
        className="mt-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-color hover:scale-105 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        Детайли
      </Link>
    </div>
  );
});

