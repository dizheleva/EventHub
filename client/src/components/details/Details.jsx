import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import CreateComment from "./create-comment/CreateComment";
import DetailsComments from "./details-comments/DetailsComments";
import DeleteEventModal from "./DeleteEventModal";
import EditEventModal from "../events/EditEventModal";
import LoadingSpinner from "../common/LoadingSpinner";
import InterestedButton from "../common/InterestedButton";
import useRequest from "../../hooks/useRequest";
import useToast from "../../hooks/useToast";
import { useUserContext } from "../../contexts/UserContext";
import { Calendar, MapPin, Tag, Edit, Trash2, ArrowLeft, Globe } from "lucide-react";
import { getCategoryDisplay, formatEventPrice } from "../../utils/categories";

export default function Details() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUserContext();
    const { data: event, request, setData: setEvent, isLoading: isLoadingEvent } = useRequest(`/data/events/${eventId}`, {})
    const { showToast } = useToast();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const urlParams = new URLSearchParams({
        where: `eventId="${eventId}"`,
        load: 'author=_ownerId:users'
    });

    const { data: comments, setData: setComments } = useRequest(`/data/comments?${urlParams.toString()}`, []);

    const handleDeleteClick = () => {
        if (!event || !event.title) {
            showToast('error', 'Не може да се изтрие събитието: Липсват данни');
            return;
        }
        setShowDeleteModal(true);
    };

    const deleteEventHandler = async () => {
        try {
            await request(`/data/events/${eventId}`, 'DELETE');
            showToast('success', 'Събитието беше изтрито успешно!');
            setShowDeleteModal(false);
            navigate('/events');
        } catch (err) {
            // Handle specific error types
            if (err.status === 401) {
                showToast('error', 'Трябва да сте влезли в профила си, за да изтриете събитие.');
                navigate('/login');
            } else if (err.status === 403) {
                showToast('error', 'Нямате право да изтриете това събитие.');
            } else if (err.status === 404) {
                showToast('error', 'Събитието не е намерено.');
                navigate('/events');
            } else {
                showToast('error', 'Не може да се изтрие събитието: ' + (err.message || 'Възникна грешка'));
            }
            setShowDeleteModal(false);
        }
    };

    const createEndCommentHandler = (createdComment) => {
        setComments(prevComments => {
            if (!Array.isArray(prevComments)) {
                return [{ ...createdComment, author: user }];
            }
            return [...prevComments, { ...createdComment, author: user }];
        });
    };

    const isOwner = isAuthenticated && user && event && event._ownerId && event._ownerId === user._id;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleString('bg-BG', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    // Parse location to extract city and address
    // Format: "Град, Адрес" - градът е първата част
    const parseLocation = (loc) => {
        if (!loc) return { city: '', address: '', isOnline: false };
        if (loc.toLowerCase().includes('онлайн')) {
            return { city: '', address: '', isOnline: true };
        }
        const parts = loc.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            // Първата част е градът, останалото е адресът
            return { city: parts[0], address: parts.slice(1).join(', '), isOnline: false };
        }
        return { city: loc, address: '', isOnline: false };
    };

    // Get author information
    const { data: users } = useRequest('/data/users', []);
    const author = users && Array.isArray(users) ? users.find(u => u._id === event?._ownerId) : null;
    const authorName = author?.username || author?.email || 'Неизвестен';

    const { city, address, isOnline } = parseLocation(event?.location || '');

    if (isLoadingEvent) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <LoadingSpinner message="Зареждане на събитието..." />
            </div>
        );
    }

    if (!event || !event._id) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-2xl text-gray-500 font-medium">Събитието не е намерено</h3>
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

            <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
                {/* Hero Image Header */}
                <div className="w-full h-96 overflow-hidden rounded-t-2xl relative">
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback) {
                                    fallback.classList.remove('hidden');
                                }
                            }}
                        />
                    ) : null}
                    <div className={`w-full h-full absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 flex items-center justify-center ${event.imageUrl ? 'hidden' : ''}`}>
                        <Calendar className="w-24 h-24 text-primary/60" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10">
                    {/* Title with Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                            {event.title}
                        </h1>
                        
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Interested Button */}
                            <InterestedButton eventId={eventId} variant="default" />
                            
                            {/* Owner Actions */}
                            {isOwner && (
                                <>
                                    <button 
                                        onClick={() => setShowEditModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-xl hover:bg-success/90 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Редактирай</span>
                                    </button>
                                    <button 
                                        onClick={handleDeleteClick}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Изтрий</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info Grid - 4 Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Schedule Card */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                График
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">Дата и час:</span>
                                    <p className="font-medium text-gray-900">
                                        {event.date ? formatDate(event.date) : 'Не е посочено'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                Локация
                            </h3>
                            <div className="space-y-3">
                                {isOnline ? (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            Онлайн събитие
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        {city && (
                                            <div>
                                                <span className="text-sm text-gray-600">Град:</span>
                                                <p className="font-medium text-gray-900">{city}</p>
                                            </div>
                                        )}
                                        {address && (
                                            <div>
                                                <span className="text-sm text-gray-600">Адрес:</span>
                                                <p className="font-medium text-gray-900">{address}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-xl">💰</span>
                                Цена:
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
                                        event.price === 0 
                                            ? "bg-green-100 text-green-700" 
                                            : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                        {formatEventPrice(event.price)}
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
                                {event.category && (
                                    <div>
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                            {getCategoryDisplay(event.category)}
                                        </span>
                                    </div>
                                )}
                                {event.tags && event.tags.trim() && (
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.split(',').map((tag, index) => (
                                            tag.trim() && (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs flex items-center gap-1"
                                                >
                                                    <Tag className="w-3 h-3" />
                                                    {tag.trim()}
                                                </span>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Author Section */}
                    {event._ownerId && (
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center gap-3 text-gray-700">
                                <span className="text-xl">👤</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium">Автор:</span>
                                    <span className="text-primary text-sm font-medium">
                                        {authorName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description Section */}
                    {event.description && (
                        <div className="prose max-w-none mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Описание</h2>
                            <div className="border-l-4 border-primary/20 pl-6">
                                <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-loose whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <DetailsComments comments={comments} setComments={setComments} />
                </div>
            </article>

            {/* Create Comment Form */}
            {isAuthenticated && (
                <CreateComment user={user} onCreateEnd={createEndCommentHandler} eventId={eventId} />
            )}

            {/* Delete Event Modal */}
            <DeleteEventModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                eventTitle={event?.title || ''}
                onConfirm={deleteEventHandler}
            />

            {/* Edit Event Modal */}
            {showEditModal && (
                <EditEventModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    eventId={eventId}
                    onEventUpdated={() => {
                        request(`/data/events/${eventId}`, 'GET').then(setEvent); // Refresh event data
                        setShowEditModal(false);
                    }}
                />
            )}
        </div>
    );
}

