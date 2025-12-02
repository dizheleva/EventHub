import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { getCategoryDisplay } from "@/utils/categories";
import { formatPrice } from "@/utils/priceFormatter";

// Format date to "DD.MM.YYYY — Ден от седмицата"
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    const daysOfWeek = ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    return `${day}.${month}.${year} — ${dayOfWeek}`;
  } catch {
    return dateString;
  }
}

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      {/* Back Button */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Назад към събитията</span>
      </button>

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

          {/* Meta Information */}
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
    </div>
  );
}

