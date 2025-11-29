import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { EditEventForm } from "./EditEventForm";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleEventUpdated(updatedEvent) {
    // Update the event in the list
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }

  if (loading) return <div className="text-center py-20">Зареждане...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="relative p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <button
              onClick={() => handleEditClick(event)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-primary hover:bg-pink-50 rounded-lg transition-colors"
              aria-label="Редактирай събитие"
            >
              <Edit className="w-5 h-5" />
            </button>
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
    </>
  );
}
