import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Edit, Trash2, Calendar, Heart, Star } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useEvents } from "@/hooks/useEvents";
import { useInterested } from "@/hooks/useInterested";
import { useComments } from "@/hooks/useComments";
import { useFavorites } from "@/hooks/useFavorites";
import { getUserLikes } from "@/api/userLikesApi";
import { getUserDisplayName, getUserNameFromId } from "@/utils/userHelpers";
import { EditEventForm } from "@/components/events/EditEventForm";
import { DeleteEventModal } from "@/components/events/DeleteEventModal";
import { getCategoryDisplay } from "@/utils/categories";
import { formatPrice } from "@/utils/priceFormatter";
import { formatDate } from "@/utils/dateFormatter";
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

  // Authorization check: Verify current user is the owner (creator) of this event
  // Support both creatorId (new) and userId (legacy) for backward compatibility
  // This check determines if user can see/edit/delete this event
  const eventCreatorId = event?.creatorId || event?.userId;
  const isOwner = isAuthenticated && user && event && eventCreatorId === user.id;

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
        // Set empty array on error to prevent crashes
        setUsers([]);
      });
  }, []);

  // Load author data when event is loaded
  useEffect(() => {
    if (event) {
      const creatorId = event.creatorId || event.userId;
      if (creatorId) {
        setIsLoadingAuthor(true);
        
        // Load author name
        const loadAuthorName = event.creatorName 
          ? Promise.resolve(event.creatorName)
          : fetch(`${USERS_API_URL}/${creatorId}`)
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

        // Load author likes
        const loadAuthorLikes = getUserLikes(Number(creatorId))
          .then(likes => likes.length)
          .catch(err => {
            console.error("Error loading author likes:", err);
            return 0;
          });

        // Load both in parallel
        Promise.all([loadAuthorName, loadAuthorLikes])
          .then(([name, likesCount]) => {
            setAuthorName(name);
            setAuthorLikesCount(likesCount);
          })
          .finally(() => setIsLoadingAuthor(false));
      }
    }
  }, [event]);

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

  // Refresh event data after update
  function refreshEvent() {
    if (id) {
      fetch(`${EVENTS_API_URL}/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Грешка при зареждане: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setEvent(data);
        })
        .catch(err => {
          console.error("Error refreshing event:", err);
        });
    }
  }

  // Authorization check before opening edit modal
  // Only owners can edit their events
  function handleEdit() {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Double-check ownership before opening modal
    // This prevents unauthorized access even if UI is manipulated
    if (!isOwner) {
      showToast("error", "Нямате права да редактирате това събитие");
      return; // Prevent opening modal for non-owners
    }

    setShowEditModal(true);
  }

  // Authorization check before opening delete modal
  // Only owners can delete their events
  function handleDelete() {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Double-check ownership before opening modal
    // This prevents unauthorized access even if UI is manipulated
    if (!isOwner) {
      showToast("error", "Нямате права да изтривате това събитие");
      return; // Prevent opening modal for non-owners
    }

    setShowDeleteModal(true);
  }

  async function handleEventUpdated(updatedEvent) {
    try {
      await updateEvent(updatedEvent.id, updatedEvent);
      setShowEditModal(false);
      refreshEvent();
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

  if (isLoading) {
    return <LoadingSpinner message="Зареждане на детайли..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retryHandler} />;
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="Събитието не беше намерено"
          message="Съжаляваме, но събитието, което търсиш, не съществува или е било премахнато."
          icon="🔍"
          action={
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад към събитията
            </Link>
          }
        />
      </div>
    );
  }

  const formattedDate = formatDate(event.date);
  const city = event.city || "";
  const category = event.category || "";
  const price = formatPrice(event.price || "Безплатно");
  const organizer = event.organizer || "";
  const organizerUrl = event.organizerUrl || "";

  // Helper function to get user name (using utility function)
  function getUserName(userId) {
    return getUserNameFromId(userId, users, "Анонимен");
  }

  // Helper function to format comment date
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

  // Handle comment submission
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

  // Handle comment deletion
  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      showToast("success", "Коментарът беше изтрит успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при изтриване на коментар");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Назад към събитията</span>
      </button>

      <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Hero Image */}
        <div className="w-full h-96 overflow-hidden rounded-t-2xl">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                {event.title}
              </h1>
              
              {/* Favorite Star Button - visible for authenticated users */}
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
            
            {/* Action Bar - Only render if user is owner */}
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

          {/* Meta Information - Responsive Grid */}
          <div className="flex flex-col gap-4 md:gap-6 mb-8">
            {/* Date and Category on one row */}
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-xl flex-shrink-0">📅</span>
              <div className="flex items-center gap-3 flex-wrap">
                {formattedDate && (
                  <span className="text-sm font-medium">{formattedDate}</span>
                )}
                {category && (
                  <>
                    {formattedDate && <span className="text-gray-300">|</span>}
                    <span className="px-2 py-1 text-sm font-medium bg-primary/10 text-primary rounded-md">
                      {getCategoryDisplay(category)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* City and Location on one row */}
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-xl flex-shrink-0">📍</span>
              <div className="flex items-center gap-3 flex-wrap">
                {city && (
                  <span className="text-sm font-medium">{city}</span>
                )}
                {event.location && (
                  <>
                    {city && <span className="text-gray-300">|</span>}
                    <span className="text-sm">{event.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Author on one row */}
            {eventCreatorId && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-xl flex-shrink-0">👤</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Автор:</span>{" "}
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
                      {" "}
                      {/* Show heart icon and likes count only if there are likes */}
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
            )}
          </div>

          {/* Price and Organizer - Structured Info Layout */}
          <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-gray-200">
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

            {/* Organizer on one row */}
            {organizer && (
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">👤</span>
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Организатор:</span>{" "}
                  {organizerUrl ? (
                    <a
                      href={organizerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {organizer}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    organizer
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Описание</h2>
            <div className="border-l-4 border-primary/20 pl-6">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-loose whitespace-pre-wrap">
                {event.description}
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

