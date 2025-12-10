import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import ProfileHeader from "./ProfileHeader";
import EditProfileModal from "./EditProfileModal";
import EventCard from "../event-card/EventCard";
import LoadingSpinner from "../common/LoadingSpinner";
import useRequest from "../../hooks/useRequest";
import { useUserContext } from "../../contexts/UserContext";
import { ArrowLeft } from "lucide-react";

/**
 * Profile - Display user profile information
 * Shows user profile with events count.
 */
export default function Profile() {
    const { userId } = useParams();
    const { user: currentUser, isAuthenticated } = useUserContext();
    const { data: users, setData: setUsers, isLoading: isLoadingUsers } = useRequest('/data/users', []);
    const { data: events, isLoading: isLoadingEvents } = useRequest('/data/events', []);
    const { data: comments, isLoading: isLoadingComments } = useRequest('/data/comments', []);
    const [showEditModal, setShowEditModal] = useState(false);

    // Find profile user
    const profileUser = useMemo(() => {
        if (!Array.isArray(users) || !userId) return null;
        return users.find(u => u._id === userId);
    }, [users, userId]);

    // Calculate user events
    const userEvents = useMemo(() => {
        if (!Array.isArray(events) || !profileUser) return [];
        return events.filter(event => event._ownerId === profileUser._id);
    }, [events, profileUser]);

    // Calculate user comments
    const commentsCount = useMemo(() => {
        if (!Array.isArray(comments) || !profileUser) return 0;
        return comments.filter(comment => comment._ownerId === profileUser._id).length;
    }, [comments, profileUser]);

    const isOwnProfile = currentUser && profileUser && currentUser._id === profileUser._id;

    // Create a map of user IDs to user data for authors
    const usersMap = useMemo(() => {
        const map = {};
        if (Array.isArray(users)) {
            users.forEach(user => {
                if (user && user._id) {
                    map[user._id] = user;
                }
            });
        }
        return map;
    }, [users]);

    // Enrich events with author information
    const eventsWithAuthors = useMemo(() => {
        return userEvents.map(event => ({
            ...event,
            author: event._ownerId ? (usersMap[event._ownerId] || null) : null
        }));
    }, [userEvents, usersMap]);

    const isLoading = isLoadingUsers || isLoadingEvents || isLoadingComments;

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <LoadingSpinner message="Зареждане на профила..." />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-2xl text-gray-500 font-medium">Потребителят не е намерен</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link 
                to="/events" 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Назад към събитията</span>
            </Link>

            <ProfileHeader
                profileUser={profileUser}
                currentUser={currentUser}
                isAuthenticated={isAuthenticated}
                isOwnProfile={isOwnProfile}
                eventsCount={userEvents.length}
                commentsCount={commentsCount}
                userId={userId}
                onEditClick={() => setShowEditModal(true)}
            />

            {/* Section 2: User Events */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Събития на потребителя</h2>
                {userEvents.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
                        Този потребител все още не е създал събития.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventsWithAuthors.map((event, index) => (
                            <div 
                                key={event._id} 
                                className="w-full min-w-0 h-full flex opacity-0 animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <EventCard {...event} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <EditProfileModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    userId={userId}
                    onProfileUpdated={(updatedUser) => {
                        setUsers(prev => {
                            if (!Array.isArray(prev)) return prev;
                            return prev.map(u => 
                                u._id === userId ? { ...u, ...updatedUser } : u
                            );
                        });
                        setShowEditModal(false);
                    }}
                />
            )}
        </div>
    );
}

