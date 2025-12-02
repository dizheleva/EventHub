import { useState, useEffect } from "react";
import { Calendar, MapPin, ExternalLink, Tag, DollarSign, User } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

export function EventDetails({ eventId }) {
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`http://localhost:5000/events/${eventId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch event: ${res.status} ${res.statusText}`);
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
  }, [eventId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Събитието не е намерено</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Image */}
        {event.imageUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-primary" />
              <span>
                {event.city ? `${event.city}, ` : ""}
                {event.location}
              </span>
            </div>
            {event.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <span className="px-2 py-1 text-sm font-medium bg-primary/10 text-primary rounded-md">
                  {event.category}
                </span>
              </div>
            )}
            {event.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-md">
                  {event.price}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Organizer */}
          {(event.organizer || event.organizerUrl) && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Организатор</h3>
              </div>
              {event.organizer && (
                <p className="text-gray-700 mb-2">{event.organizer}</p>
              )}
              {event.organizerUrl && (
                <a
                  href={event.organizerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-color transition-all"
                >
                  Посети уебсайта
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

