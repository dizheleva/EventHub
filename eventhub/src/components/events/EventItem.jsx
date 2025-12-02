import { Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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

export function EventItem({ event, onEdit, onDelete }) {
  const formattedDate = formatDate(event.date);
  const city = event.city || "";
  const category = event.category || "";
  const price = formatPrice(event.price || "Безплатно");
  const organizer = event.organizer || "";

  return (
    <div className="relative w-full max-w-md p-8 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col group">
      {/* Buttons positioned above the image */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={() => onEdit(event.id)}
          className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm focus-visible:outline-2 focus-visible:outline-yellow-500 focus-visible:outline-offset-2"
          aria-label="Редактирай събитие"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(event)}
          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2"
          aria-label="Изтрий събитие"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      {event.imageUrl && (
        <Link 
          to={`/events/${event.id}`}
          className="block focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-lg"
        >
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer hover:opacity-90 transition-opacity" 
          />
        </Link>
      )}
      <Link 
        to={`/events/${event.id}`} 
        className="hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded focus-visible:outline-dashed"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex-shrink-0 cursor-pointer">{event.title}</h3>
      </Link>
      
      {/* City and Category - 📍 София | 🎭 Култура */}
      {(city || category) && (
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0 text-sm text-gray-700">
          {city && <span>📍 {city}</span>}
          {city && category && <span className="text-gray-400">|</span>}
          {category && <span>{getCategoryDisplay(category)}</span>}
        </div>
      )}

      {/* Date - 📅 22.03.2025 — Събота */}
      {formattedDate && (
        <div className="mb-3 flex-shrink-0 text-sm text-gray-600">
          📅 {formattedDate}
        </div>
      )}

      {/* Price - Цена: Безплатно */}
      <div className="mb-3 flex-shrink-0">
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
      </div>

      {/* Organizer - Организатор: Национален театър */}
      {organizer && (
        <div className="mb-4 flex-shrink-0 text-sm text-gray-700">
          <span className="font-medium">Организатор:</span> {organizer}
        </div>
      )}

      {/* View Details Button */}
      <Link
        to={`/events/${event.id}`}
        className="mt-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-color hover:scale-105 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        Детайли
      </Link>
    </div>
  );
}

