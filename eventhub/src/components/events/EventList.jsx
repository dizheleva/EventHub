import { useState, useEffect } from "react";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, []);

  if (loading) return <div className="text-center py-20">Зареждане...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <div key={event.id} className="p-6 bg-white rounded-xl shadow-md">
          <img src={event.imageUrl} alt={event.title} className="rounded-lg mb-4" />
          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
          <p className="text-gray-600">{event.date} — {event.location}</p>
          <p className="text-gray-500 mt-2">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
