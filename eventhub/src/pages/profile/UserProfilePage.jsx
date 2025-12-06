import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Mail, User, Calendar, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useEvents } from "@/hooks/useEvents";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useToast } from "@/contexts/ToastContext";

/**
 * Format date for "Member since" display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
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

/**
 * UserProfilePage - Display user profile information
 * 
 * Only the profile owner can view their own profile.
 * If userId !== current user.id, redirects to /events
 */
export function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, isAuthReady } = useAuth();
  const { user: profileUser, isLoading: isLoadingUser, error: userError, fetchUser } = useUser();
  const { events, isLoading: isLoadingEvents, fetchEvents } = useEvents();
  const { showToast } = useToast();

  // Authorization check: Only allow users to view their own profile
  useEffect(() => {
    if (!isAuthReady) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // If userId doesn't match current user, redirect to events
    if (userId !== String(currentUser?.id)) {
      showToast("error", "Нямате права да виждате този профил.");
      navigate("/events");
      return;
    }

    // Load user profile and events
    if (userId) {
      fetchUser(userId);
      fetchEvents();
    }
  }, [userId, currentUser, isAuthenticated, isAuthReady, navigate, showToast, fetchUser, fetchEvents]);

  // Calculate number of events created by this user
  const userEventsCount = useMemo(() => {
    if (!events || !profileUser) return 0;
    const userIdNum = Number(userId);
    return events.filter(event => {
      const eventCreatorId = event.creatorId || event.userId;
      return eventCreatorId === userIdNum;
    }).length;
  }, [events, profileUser, userId]);

  // Show loading while auth is initializing or profile is loading
  if (!isAuthReady || isLoadingUser) {
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

  // If no profile user, don't render (redirect will happen)
  if (!profileUser) {
    return null;
  }

  const memberSince = formatMemberSince(profileUser.createdAt);
  const avatarInitial = profileUser.username 
    ? profileUser.username.charAt(0).toUpperCase() 
    : profileUser.email.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Card - centered like EventDetails */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Profile Header with gradient background */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.username || "Avatar"}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
                {avatarInitial}
              </div>
            )}
            
            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {profileUser.username || "Потребител"}
              </h1>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span className="text-lg">{profileUser.email}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => navigate(`/profile/${userId}/edit`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color hover:scale-105 transition-all duration-200"
            >
              <Edit className="w-5 h-5" />
              Редактирай профила
            </button>
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

            {/* Events Created */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Създадени събития</h3>
                <p className="text-lg text-gray-900 font-medium">
                  {isLoadingEvents ? (
                    <span className="text-gray-400">Зареждане...</span>
                  ) : (
                    <span className="text-primary font-bold">{userEventsCount}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
