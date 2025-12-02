import { Edit, Trash2 } from "lucide-react";
import { getCategoryDisplay } from "@/utils/categories";

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
  const price = event.price || "Безплатно";
  const organizer = event.organizer || "";

  return (
    <div className="relative w-full max-w-md p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
      {/* Buttons positioned above the image */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          onClick={() => onEdit(event.id)}
          className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
          aria-label="Редактирай събитие"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(event)}
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
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex-shrink-0">{event.title}</h3>
      
      {/* City and Category - 📍 София | 🎭 Култура */}
      {(city || category) && (
        <div className="flex flex-wrap items-center gap-2 mb-2 flex-shrink-0 text-sm text-gray-700">
          {city && <span>📍 {city}</span>}
          {city && category && <span className="text-gray-400">|</span>}
          {category && <span>{getCategoryDisplay(category)}</span>}
        </div>
      )}

      {/* Date - 📅 22.03.2025 — Събота */}
      {formattedDate && (
        <div className="mb-2 flex-shrink-0 text-sm text-gray-600">
          📅 {formattedDate}
        </div>
      )}

      {/* Price - Цена: Безплатно */}
      <div className="mb-2 flex-shrink-0">
        <span className="text-sm text-gray-700">
          <span className="font-medium">Цена:</span>{" "}
          <span
            className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${
              price.toLowerCase().includes("безплатно") || price.toLowerCase().includes("безплатн")
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {price}
          </span>
        </span>
      </div>

      {/* Organizer - Организатор: Национален театър */}
      {organizer && (
        <div className="mb-3 flex-shrink-0 text-sm text-gray-700">
          <span className="font-medium">Организатор:</span> {organizer}
        </div>
      )}

      {/* Description */}
      <p className="text-gray-500 mt-2 line-clamp-3 flex-grow">{event.description}</p>
    </div>
  );
}

