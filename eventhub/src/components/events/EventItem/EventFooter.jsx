import { memo } from "react";
import { Calendar, MapPin } from "lucide-react";
import { formatEventPrice } from "@/utils/eventHelpers";

/**
 * EventFooter - Footer section for event card (dates, location, price)
 */
const EventFooter = memo(function EventFooter({
  startDateTime,
  endDateTime,
  city,
  address,
  isOnline,
  price,
  isExternal
}) {
  return (
    <>
      {/* City - под заглавието */}
      {city && (
        <div className="mb-3">
          <span className="text-sm text-gray-600 font-medium">
            {city}
          </span>
        </div>
      )}

      {/* Начална и крайна дата и час */}
      {startDateTime && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">Начало: {startDateTime}</span>
          </div>
          {endDateTime && endDateTime !== startDateTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
              <span>Край: {endDateTime}</span>
            </div>
          )}
        </div>
      )}

      {/* Останалите подробности за място */}
      {!isOnline && address && (
        <div className="mb-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{address}</span>
          </div>
        </div>
      )}

      {/* Онлайн локация */}
      {isOnline && (
        <div className="mb-3 text-sm text-gray-600">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
            Онлайн събитие
          </span>
        </div>
      )}

      {/* Цена - не се показва за външни събития */}
      {!isExternal && (
        <div className="mb-3">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
            price === 0 
              ? "bg-green-100 text-green-700" 
              : "bg-yellow-100 text-yellow-700"
          }`}>
            {formatEventPrice(price)}
          </span>
        </div>
      )}
    </>
  );
});

export default EventFooter;

