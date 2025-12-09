import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ExternalLink, Edit, Trash2, Calendar, Heart, Star, MapPin, Clock, Tag, Users, Globe } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { useEvents } from "@/hooks/useEvents";
import { useInterested } from "@/hooks/useInterested";
import { useComments } from "@/hooks/useComments";
import { useFavorites } from "@/hooks/useFavorites";
import { getUserLikes } from "@/api/userLikesApi";
import { getUserDisplayName, getUserNameFromId } from "@/utils/userHelpers";
import { normalizeEvent, formatEventPrice, formatDuration } from "@/utils/eventHelpers";
import { EditEventForm } from "@/components/events/EditEventForm";
import { DeleteEventModal } from "@/components/events/DeleteEventModal";
import { getCategoryDisplay } from "@/utils/categories";
import { API_BASE_URL } from "@/config/api";

const USERS_API_URL = `${API_BASE_URL}/users`;
const EVENTS_API_URL = `${API_BASE_URL}/events`;

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { deleteEvent, updateEvent } = useEvents();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [authorName, setAuthorName] = useState(null);
  const [authorLikesCount, setAuthorLikesCount] = useState(0);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const { showToast } = useToast();
  
  // Use interest hook for this event
  const { toggleInterest, interestsCount, userInterested, loading: interestsLoading } = useInterested(event?.id);
  
  // Use comments hook for this event
  const { comments, loading: commentsLoading, addComment, deleteComment } = useComments(event?.id);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Use favorites hook
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Normalize event when loaded
  const normalizedEvent = event ? normalizeEvent(event) : null;
  
  // Authorization check
  const eventCreatorId = normalizedEvent?.creatorId;
  const isExternal = event?.isExternal === true;
  const isOwner = isAuthenticated && user && normalizedEvent && eventCreatorId === user.id && !isExternal;

  // Format date/time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  // Load users for comment display
  useEffect(() => {
    fetch(USERS_API_URL)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load users: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => {
        console.error("Error loading users:", err);
        setUsers([]);
      });
  }, []);

  // Load author data when event is loaded
  useEffect(() => {
    if (normalizedEvent && eventCreatorId) {
      setIsLoadingAuthor(true);
      
      const loadAuthorName = fetch(`${USERS_API_URL}/${eventCreatorId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch author");
          }
          return res.json();
        })
        .then(userData => {
          return getUserDisplayName(userData, "Неизвестен");
        })
        .catch(err => {
          console.error("Error loading author:", err);
          return "Неизвестен";
        });

      const loadAuthorLikes = getUserLikes(Number(eventCreatorId))
        .then(likes => likes.length)
        .catch(err => {
          console.error("Error loading author likes:", err);
          return 0;
        });

      Promise.all([loadAuthorName, loadAuthorLikes])
        .then(([name, likesCount]) => {
          setAuthorName(name);
          setAuthorLikesCount(likesCount);
        })
        .finally(() => setIsLoadingAuthor(false));
    }
  }, [normalizedEvent, eventCreatorId]);

  // Load event
  useEffect(() => {
    if (!id) {
      setError("Липсва ID на събитието");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`${EVENTS_API_URL}/${id}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Събитието не беше намерено");
          }
          throw new Error(`Грешка при зареждане: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || "Възникна грешка при зареждане на събитието");
        setIsLoading(false);
      });
  }, [id]);


  function handleEdit() {
    if (isExternal) {
      showToast("error", "Външните събития не могат да се редактират");
      return;
    }
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }
    if (!isOwner) {
      showToast("error", "Нямате права да редактирате това събитие");
      return;
    }
    setShowEditModal(true);
  }

  function handleDelete() {
    if (isExternal) {
      showToast("error", "Външните събития не могат да се изтриват");
      return;
    }
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }
    if (!isOwner) {
      showToast("error", "Нямате права да изтривате това събитие");
      return;
    }
    setShowDeleteModal(true);
  }

  async function handleEventUpdated(updatedEvent) {
    try {
      // Update local state immediately with the updated event data
      setEvent(updatedEvent);
      setShowEditModal(false);
      
      // Also update in the global events list (if it exists there)
      // This won't throw an error if event is not in the list
      try {
        await updateEvent(updatedEvent.id, updatedEvent);
      } catch (err) {
        // Ignore error - event might not be in the global events list
        // The local state is already updated above
        console.warn("Could not update event in global list:", err.message);
      }
      
      showToast("success", "Събитието беше обновено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при обновяване на събитие");
    }
  }

  async function handleEventDeleted() {
    try {
      if (id) {
        await deleteEvent(id);
        setShowDeleteModal(false);
        showToast("success", "Събитието беше изтрито успешно!");
        setTimeout(() => {
          navigate("/events");
        }, 1500);
      }
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при изтриване на събитие");
    }
  }

  function retryHandler() {
    if (id) {
      setIsLoading(true);
      setError(null);
      fetch(`${EVENTS_API_URL}/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Грешка при зареждане: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setEvent(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message || "Възникна грешка при зареждане на събитието");
          setIsLoading(false);
        });
    }
  }

  // Helper functions
  function getUserName(userId) {
    return getUserNameFromId(userId, users, "Анонимен");
  }

  function formatCommentDate(dateString) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "току-що";
      if (diffMins < 60) return `преди ${diffMins} ${diffMins === 1 ? "минута" : "минути"}`;
      if (diffHours < 24) return `преди ${diffHours} ${diffHours === 1 ? "час" : "часа"}`;
      if (diffDays < 7) return `преди ${diffDays} ${diffDays === 1 ? "ден" : "дни"}`;
      
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newCommentText.trim()) {
      showToast("error", "Коментарът не може да бъде празен");
      return;
    }

    setIsSubmittingComment(true);
    try {
      await addComment(newCommentText.trim());
      setNewCommentText("");
      showToast("success", "Коментарът беше публикуван успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при публикуване на коментар");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      showToast("success", "Коментарът беше изтрит успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при изтриване на коментар");
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Зареждане на детайли..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retryHandler} />;
  }

  if (!event || !normalizedEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="Събитието не беше намерено"
          message="Съжаляваме, но събитието, което търсиш, не съществува или е било премахнато."
          icon="🔍"
          action={
            <BackButton 
              to="/events"
              text="Назад към събитията"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all"
              noDefaultStyles={true}
            />
          }
        />
      </div>
    );
  }

  // Get map URL if coordinates exist
  const getMapUrl = () => {
    if (normalizedEvent.location?.coordinates?.lat && normalizedEvent.location?.coordinates?.lng) {
      return `https://www.google.com/maps?q=${normalizedEvent.location.coordinates.lat},${normalizedEvent.location.coordinates.lng}`;
    }
    return null;
  };

  const mapUrl = getMapUrl();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <BackButton 
        to="/events"
        text="Назад към събитията"
        className="mb-8"
      />

      <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Hero Image */}
        <div className="w-full h-96 overflow-hidden rounded-t-2xl relative">
          {normalizedEvent.imageUrl ? (
            <img
              src={normalizedEvent.imageUrl}
              alt={normalizedEvent.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center">
              <Calendar className="w-24 h-24 text-primary/60" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-10">
          {/* Title with Favorite and Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                {normalizedEvent.title}
              </h1>
              
              {/* Favorite Star Button */}
              {isAuthenticated && (
                <button
                  onClick={async () => {
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
                  }}
                  disabled={isTogglingFavorite}
                  className={`p-2 rounded-lg transition-all ${
                    isFavorite(event.id)
                      ? "text-yellow-500 hover:bg-yellow-50"
                      : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                  } ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={isFavorite(event.id) ? "Премахни от любими" : "Добави в любими"}
                >
                  <Star className={`w-6 h-6 ${isFavorite(event.id) ? "fill-yellow-500" : ""}`} />
                </button>
              )}
            </div>
            
            {/* Action Bar */}
            {isOwner && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-all shadow-sm hover:shadow-md"
                >
                  <Edit className="w-5 h-5" />
                  Редактирай
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                >
                  <Trash2 className="w-5 h-5" />
                  Изтрий
                </button>
              </div>
            )}
          </div>

          {/* Interest Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              {userInterested ? (
                <button
                  onClick={async () => {
                    try {
                      await toggleInterest();
                    } catch (err) {
                      showToast("error", err.message || "Възникна грешка при премахване на интереса");
                    }
                  }}
                  disabled={interestsLoading}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-primary bg-white text-primary rounded-xl font-medium hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-5 h-5 fill-primary" />
                  Не се интересувам
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      showToast("error", "Моля, влезте в профила си, за да изразите интерес.");
                      return;
                    }
                    try {
                      await toggleInterest();
                    } catch (err) {
                      showToast("error", err.message || "Възникна грешка при добавяне на интерес");
                    }
                  }}
                  disabled={interestsLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="w-5 h-5" />
                  Интересувам се
                </button>
              )}
              <span className="text-gray-700 font-medium">
                {interestsCount} {interestsCount === 1 ? "човек се интересува" : "хора се интересуват"}
              </span>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Schedule Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                График
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Начало:</span>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(normalizedEvent.startDate)}
                  </p>
                </div>
                {normalizedEvent.endDate && (
                  <div>
                    <span className="text-sm text-gray-600">Край:</span>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(normalizedEvent.endDate)}
                    </p>
                  </div>
                )}
                {normalizedEvent.durationMinutes && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Продължителност: {formatDuration(normalizedEvent.durationMinutes)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Локация
              </h3>
              <div className="space-y-3">
                {normalizedEvent.isOnline ? (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Онлайн събитие
                    </span>
                  </div>
                ) : (
                  <>
                    {normalizedEvent.location?.city && (
                      <div>
                        <span className="text-sm text-gray-600">Град:</span>
                        <p className="font-medium text-gray-900">{normalizedEvent.location.city}</p>
                      </div>
                    )}
                    {normalizedEvent.location?.address && (
                      <div>
                        <span className="text-sm text-gray-600">Адрес:</span>
                        <p className="font-medium text-gray-900">{normalizedEvent.location.address}</p>
                      </div>
                    )}
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                      >
                        <MapPin className="w-4 h-4" />
                        Виж на карта
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">💰</span>
                Цена:
              </h3>
              <div className="space-y-3">
                <div>
                  <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
                    normalizedEvent.price === 0 
                      ? "bg-green-100 text-green-700" 
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {formatEventPrice(normalizedEvent.price)}
                  </span>
                </div>                
              </div>
            </div>

            {/* Category & Tags Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Категория & Тагове
              </h3>
              <div className="space-y-3">
                {normalizedEvent.category && (
                  <div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {getCategoryDisplay(normalizedEvent.category)}
                    </span>
                  </div>
                )}
                {normalizedEvent.tags && normalizedEvent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {normalizedEvent.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Author Section */}
          {eventCreatorId && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-xl">👤</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Автор:</span>
                  {isLoadingAuthor ? (
                    <span className="text-gray-400 text-sm">Зареждане...</span>
                  ) : (
                    <>
                      <Link
                        to={`/profile/${eventCreatorId}`}
                        className="text-primary hover:underline text-sm"
                      >
                        {authorName || "Неизвестен"}
                      </Link>
                      {authorLikesCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-sm ml-1">
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                          <span className="text-red-500">{authorLikesCount}</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Описание</h2>
            <div className="border-l-4 border-primary/20 pl-6">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-loose whitespace-pre-wrap">
                {normalizedEvent.description}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Коментари</h2>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-8">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Напишете вашия коментар..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-3"
                  rows={4}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? "Публикуване..." : "Публикувай"}
                </button>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-gray-700">
                За да оставите коментар, трябва да влезете в профила си.
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="text-center py-8 text-gray-500">Зареждане на коментари...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Все още няма коментари. Бъдете първият!</div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => {
                  const isOwnComment = user && comment.userId === user.id;
                  return (
                    <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {getUserName(comment.userId)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatCommentDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                        {isOwnComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Изтрий
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Редактирай събитие"
        >
          <EditEventForm
            eventId={id}
            onEventUpdated={handleEventUpdated}
            onClose={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteEventModal
          eventId={id}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={handleEventDeleted}
          onError={(eventId, error) => {
            showToast("error", error.message || "Възникна грешка при изтриване на събитие");
          }}
          deleteEvent={deleteEvent}
        />
      )}
    </div>
  );
}
