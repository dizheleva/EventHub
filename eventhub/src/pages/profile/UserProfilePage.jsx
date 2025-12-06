import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Mail, User, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useToast } from "@/contexts/ToastContext";

/**
 * UserProfilePage - Display user profile information
 * 
 * Only the profile owner can view their own profile.
 * If userId !== current user.id, redirects to /events
 */
export function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
    if (userId !== String(user?.id)) {
      showToast("error", "Нямате права да виждате този профил.");
      navigate("/events");
      return;
    }

    // Load user profile data
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user from backend
        const response = await fetch(`http://localhost:5000/users/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Потребителят не е намерен");
          }
          throw new Error(`Грешка при зареждане на профила: ${response.status}`);
        }

        const userData = await response.json();
        // Remove password from user data for security
        const { password: _, ...userWithoutPassword } = userData;
        setProfileUser(userWithoutPassword);
      } catch (err) {
        const errorMessage = err.message || "Възникна грешка при зареждане на профила";
        setError(errorMessage);
        showToast("error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId, user, isAuthenticated, isAuthReady, navigate, showToast]);

  // Show loading while auth is initializing or profile is loading
  if (!isAuthReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане на профил..." />
      </div>
    );
  }

  // Show error if profile failed to load
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // If no profile user, don't render (redirect will happen)
  if (!profileUser) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Edit button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Моят профил</h1>
        <button
          onClick={() => navigate(`/profile/${userId}/edit`)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color hover:scale-105 transition-all duration-200"
        >
          <Edit className="w-5 h-5" />
          Редактирай
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 px-8 py-12">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profileUser.name ? profileUser.name.charAt(0).toUpperCase() : profileUser.email.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {profileUser.name || "Потребител"}
              </h2>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {profileUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Name */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Име</h3>
                <p className="text-lg text-gray-900">{profileUser.name || "Не е посочено"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Имейл</h3>
                <p className="text-lg text-gray-900">{profileUser.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">ID на потребител</h3>
                <p className="text-lg text-gray-900 font-mono">{profileUser.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

