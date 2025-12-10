import { Edit, Mail, User, Calendar, CalendarDays } from "lucide-react";

/**
 * ProfileHeader - Reusable profile header component
 */
export default function ProfileHeader({
  profileUser,
  currentUser,
  isAuthenticated,
  isOwnProfile,
  eventsCount = 0,
  commentsCount = 0,
  userId,
  onEditClick,
}) {

  // Get user display name - use username if available, otherwise use email prefix
  const userName = profileUser?.username 
    ? profileUser.username 
    : (profileUser?.email ? profileUser.email.split("@")[0] : "Потребител");
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

  const memberSince = formatMemberSince(profileUser?._createdOn || profileUser?.createdAt);

  return (
    <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn mb-8">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          {profileUser?.avatarUrl ? (
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
            </div>
            <div className="flex flex-col gap-3 text-gray-700">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CalendarDays className="w-5 h-5" />
                <span className="text-lg">
                  Създадени събития: <span className="font-bold text-primary">{eventsCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-5 h-5" />
                <span className="text-lg">
                  Коментари: <span className="font-bold text-primary">{commentsCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile && onEditClick && (
            <div className="flex flex-col gap-3">
              <button
                onClick={onEditClick}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color hover:scale-105 transition-all duration-200"
              >
                <Edit className="w-5 h-5" />
                Редактирай профил
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          {profileUser?.username && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Потребителско име</h3>
                <p className="text-lg text-gray-900 font-medium">{profileUser.username}</p>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Имейл</h3>
              <p className="text-lg text-gray-900 font-medium">{profileUser?.email || "Неизвестно"}</p>
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
  );
}

