import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Modal } from "@/components/common/Modal";
import { Toast } from "@/components/common/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvents";
import { EditEventForm } from "@/components/events/EditEventForm";
import { DeleteEventModal } from "@/components/events/DeleteEventModal";
import { getCategoryDisplay } from "@/utils/categories";
import { formatPrice } from "@/utils/priceFormatter";
import { formatDate } from "@/utils/dateFormatter";

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
  const [toast, setToast] = useState(null);

  // Check if current user is the author (creator) of this event
  // Support both creatorId (new) and userId (legacy) for backward compatibility
  const eventCreatorId = event?.creatorId || event?.userId;
  const isOwner = isAuthenticated && user && event && eventCreatorId === user.id;

  useEffect(() => {
    if (!id) {
      setError("Липсва ID на събитието");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:5000/events/${id}`)
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
      fetch(`http://localhost:5000/events/${id}`)
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

  function handleEdit() {
    if (!isAuthenticated) {
      setToast({
        type: "error",
        message: "Моля, влезте в профила си.",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!isOwner) {
      setToast({
        type: "error",
        message: "Нямате право да редактирате това събитие.",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setShowEditModal(true);
  }

  function handleDelete() {
    if (!isAuthenticated) {
      setToast({
        type: "error",
        message: "Моля, влезте в профила си.",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!isOwner) {
      setToast({
        type: "error",
        message: "Нямате право да изтриете това събитие.",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setShowDeleteModal(true);
  }

  async function handleEventUpdated(updatedEvent) {
    try {
      await updateEvent(updatedEvent.id, updatedEvent);
      setShowEditModal(false);
      refreshEvent();
      setToast({
        type: "success",
        message: "Събитието беше обновено успешно!",
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при обновяване на събитие",
      });
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleEventDeleted() {
    try {
      if (id) {
        await deleteEvent(id);
        setShowDeleteModal(false);
        setToast({
          type: "success",
          message: "Събитието беше изтрито успешно!",
        });
        setTimeout(() => {
          setToast(null);
          navigate("/events");
        }, 1500);
      }
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при изтриване на събитие",
      });
      setTimeout(() => setToast(null), 3000);
    }
  }

  function retryHandler() {
    if (id) {
      setIsLoading(true);
      setError(null);
      fetch(`http://localhost:5000/events/${id}`)
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
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Събитието не беше намерено</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад към събитията
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = formatDate(event.date);
  const city = event.city || "";
  const category = event.category || "";
  const price = formatPrice(event.price || "Безплатно");
  const organizer = event.organizer || "";
  const organizerUrl = event.organizerUrl || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Назад към събитията</span>
        </button>

        {/* Action Buttons - Only visible to owner */}
        {isOwner && (
          <div className="flex items-center gap-3">
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

      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Hero Image */}
        {event.imageUrl && (
          <div className="w-full h-96 overflow-hidden rounded-t-2xl">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-10">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {event.title}
          </h1>

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
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Описание</h2>
            <div className="border-l-4 border-primary/20 pl-6">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed md:leading-loose whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
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
            setToast({
              type: "error",
              message: error.message || "Възникна грешка при изтриване на събитие",
            });
            setTimeout(() => setToast(null), 3000);
          }}
          deleteEvent={deleteEvent}
        />
      )}
    </div>
  );
}

