import { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { EditEventForm } from "./EditEventForm";
import { DeleteEventModal } from "./DeleteEventModal";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  function fetchEvents() {
    setLoading(true);
    fetch("http://localhost:5000/events")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function handleEditClick(event) {
    setEditingEvent(event);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingEvent(null);
  }

  function handleEventUpdated() {
    // Refresh the event list from server to ensure we have the latest data
    fetchEvents();
  }

  function handleDeleteClick(event) {
    setDeletingEventId(event.id);
    setIsDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    setIsDeleteModalOpen(false);
    setDeletingEventId(null);
  }

  function handleEventDeleted() {
    // Refresh the event list from server after deletion
    fetchEvents();
  }

  if (loading) return <div className="text-center py-20">Зареждане...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="relative p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            {/* Buttons positioned above the image */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={() => handleEditClick(event)}
                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
                aria-label="Редактирай събитие"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(event)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
                aria-label="Изтрий събитие"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-48 object-cover rounded-lg mb-4" 
              />
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-1">{event.date} — {event.location}</p>
            <p className="text-gray-500 mt-2 line-clamp-3">{event.description}</p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Редактирай събитие"
      >
        {editingEvent && (
          <EditEventForm
            event={editingEvent}
            onEventUpdated={handleEventUpdated}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <DeleteEventModal
        eventId={deletingEventId}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDeleted={handleEventDeleted}
      />
    </>
  );
}
