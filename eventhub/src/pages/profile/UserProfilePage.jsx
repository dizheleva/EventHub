import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Mail, User, Calendar, CalendarDays, Star, Heart } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useEvents } from "@/hooks/useEvents";
import { getCommentsByUser } from "@/api/commentsApi";
import { getUserLikes, hasUserLiked, giveLike, removeLike } from "@/api/userLikesApi";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EventItem } from "@/components/events/EventItem";
import { LikeButton } from "@/components/profile/LikeButton";
import { useToast } from "@/hooks/useToast";

/**
 * UserProfilePage - Display user profile information
 * 
 * Shows user profile with events and comments count.
 * Only the profile owner can see "Edit Profile" button.
 */
export function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { user: profileUser, isLoading: isLoadingUser, error: userError, fetchUser } = useUser();
  const { events, isLoading: isLoadingEvents, fetchEvents } = useEvents();
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [likes, setLikes] = useState([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const { showToast } = useToast();

  // Load user profile, events, comments, and likes
  useEffect(() => {
    if (!userId) return;

    // Load user profile
    fetchUser(userId).catch((err) => {
      console.error("Error fetching user:", err);
      // Error is handled by useUser hook
    });
    
    // Load all events
    fetchEvents().catch((err) => {
      console.error("Error fetching events:", err);
      // Error is handled by useEvents hook
    });
    
    // Load comments for this user
    setIsLoadingComments(true);
    getCommentsByUser(Number(userId))
      .then(data => setComments(data))
      .catch(err => {
        console.error("Error fetching comments:", err);
        setComments([]);
      })
      .finally(() => setIsLoadingComments(false));

    // Load likes for this user
    setIsLoadingLikes(true);
    getUserLikes(Number(userId))
      .then(data => {
        setLikes(data);
      })
      .catch(err => {
        console.error("Error fetching likes:", err);
        setLikes([]);
      })
      .finally(() => setIsLoadingLikes(false));

    // Check if current user has liked this profile
    if (isAuthenticated && currentUser?.id && Number(userId) !== currentUser.id) {
      hasUserLiked(currentUser.id, Number(userId))
        .then(liked => {
          setHasLiked(liked);
        })
        .catch(err => {
          console.error("Error checking like status:", err);
          setHasLiked(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthenticated, currentUser?.id]);

  // Calculate number of events created by this user
  const userEvents = useMemo(() => {
    if (!events || !profileUser) return [];
    const userIdNum = Number(userId);
    return events.filter(event => {
      const eventCreatorId = event.creatorId;
      return eventCreatorId === userIdNum;
    });
  }, [events, profileUser, userId]);

  const userEventsCount = userEvents.length;
  const commentsCount = comments.length;
  const likesCount = likes.length;
  
  // Get user display name
  const userName = profileUser?.username || (profileUser?.email ? profileUser.email.split("@")[0] : "Потребител");
  const avatarInitial = userName.charAt(0).toUpperCase();

  // Format date for "Member since" display
  function formatMemberSince(dateString) {
    if (!dateString) return "Неизвестно";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      
      const months = [
        "януари", "февруари", "март", "април", "май", "юни",
        "юли", "август", "септември", "октомври", "ноември", "декември"
      ];
      
      return `${day} ${months[date.getMonth()]} ${year}`;
    } catch {
      return dateString;
    }
  }

  const memberSince = formatMemberSince(profileUser?.createdAt);

  // Show loading while profile is loading
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане на профил..." />
      </div>
    );
  }

  // Show error if profile failed to load
  if (userError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage message={userError} onRetry={() => fetchUser(userId)} />
      </div>
    );
  }

  // If no profile user and not loading, show loading (might still be loading or redirect will happen)
  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане на профил..." />
      </div>
    );
  }

  const isOwnProfile = currentUser && Number(userId) === currentUser.id;

  // Handle like/unlike toggle
  async function handleToggleLike() {
    if (!isAuthenticated || !currentUser?.id || isOwnProfile || isTogglingLike) {
      return;
    }

    setIsTogglingLike(true);
    const previousLiked = hasLiked;
    let removedLike = null;

    // Optimistic update
    setHasLiked(!previousLiked);
    setLikes(prev => {
      if (!previousLiked) {
        // Adding a like - add optimistic entry
        return [...prev, { id: `temp-${Date.now()}`, fromUserId: currentUser.id, toUserId: Number(userId) }];
      } else {
        // Removing a like - find and store the entry, then remove it
        const likeToRemove = prev.find(like => like.fromUserId === currentUser.id && like.toUserId === Number(userId));
        removedLike = likeToRemove || null;
        return prev.filter(like => !(like.fromUserId === currentUser.id && like.toUserId === Number(userId)));
      }
    });

    try {
      if (previousLiked) {
        await removeLike(currentUser.id, Number(userId));
        showToast("success", "Харесването беше премахнато");
      } else {
        await giveLike(currentUser.id, Number(userId));
        showToast("success", "Харесването беше добавено");
      }
      // Reload likes to get fresh data from server
      const updatedLikes = await getUserLikes(Number(userId));
      setLikes(updatedLikes);
      // Update like status
      setHasLiked(!previousLiked);
    } catch (err) {
      // Rollback on error
      setHasLiked(previousLiked);
      setLikes(prev => {
        if (!previousLiked) {
          // Remove the optimistic entry we added (find by temp ID pattern)
          return prev.filter(like => !(typeof like.id === 'string' && like.id.startsWith('temp-') && like.fromUserId === currentUser.id && like.toUserId === Number(userId)));
        } else {
          // Restore the like we removed
          if (removedLike) {
            return [...prev, removedLike];
          }
          return prev;
        }
      });
      showToast("error", err.message || "Възникна грешка при промяна на харесването");
    } finally {
      setIsTogglingLike(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <BackButton 
        useHistory={true}
        text="Назад"
        className="mb-8"
      />

      {/* Section 1: Profile Header */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn mb-8">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={userName}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
                {avatarInitial}
              </div>
            )}
            
            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  {userName}
                </h1>
                {/* Likes count */}
                <div className="flex items-center gap-1 text-red-500">
                  <Heart className="w-6 h-6 fill-red-500" />
                  <span className="text-xl font-bold text-gray-700">{isLoadingLikes ? "..." : likesCount}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-gray-700">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <CalendarDays className="w-5 h-5" />
                  <span className="text-lg">
                    Създадени събития: <span className="font-bold text-primary">{isLoadingEvents ? "..." : userEventsCount}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="w-5 h-5" />
                  <span className="text-lg">
                    Коментари: <span className="font-bold text-primary">{isLoadingComments ? "..." : commentsCount}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Edit Button - Only show if it's own profile */}
              {isOwnProfile && (
                <button
                  onClick={() => navigate(`/profile/${userId}/edit`)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color hover:scale-105 transition-all duration-200"
                >
                  <Edit className="w-5 h-5" />
                  Редактирай профил
                </button>
              )}

              {/* Like Button - Only show if viewing someone else's profile */}
              {!isOwnProfile && isAuthenticated && currentUser?.id && (
                <LikeButton
                  isLiked={hasLiked}
                  onToggle={handleToggleLike}
                  disabled={isTogglingLike}
                />
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Потребителско име</h3>
                <p className="text-lg text-gray-900 font-medium">{profileUser.username || "Не е посочено"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Имейл</h3>
                <p className="text-lg text-gray-900 font-medium">{profileUser.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Член от</h3>
                <p className="text-lg text-gray-900 font-medium">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Section 2: User Events */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Събития на потребителя</h2>
        {isLoadingEvents ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Зареждане на събития..." />
          </div>
        ) : userEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
            Този потребител все още не е създал събития.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map((event) => (
              <div key={event.id} className="w-full min-w-0 h-full flex">
                <EventItem
                  event={event}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  authorLikesCount={likesCount}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
