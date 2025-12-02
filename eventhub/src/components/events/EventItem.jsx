import { Edit, Trash2 } from "lucide-react";

export function EventItem({ event, onEdit, onDelete }) {
  return (
    <div className="relative w-full max-w-md h-[420px] m-6 p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
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
          className="w-full h-48 object-cover rounded-lg mb-4 flex-shrink-0" 
        />
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex-shrink-0">{event.title}</h3>
      <div className="flex flex-wrap items-center gap-2 mb-2 flex-shrink-0">
        {event.category && (
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
            {event.category}
          </span>
        )}
        {event.price && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-md">
            {event.price}
          </span>
        )}
      </div>
      <p className="text-gray-600 mb-1 flex-shrink-0">
        {event.date} — {event.city ? `${event.city}, ` : ""}{event.location}
      </p>
      <div className="flex-1 overflow-y-auto mt-2 pr-2">
        <p className="text-gray-500">{event.description}</p>
      </div>
    </div>
  );
}

