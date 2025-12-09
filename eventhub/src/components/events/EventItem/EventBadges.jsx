import { memo } from "react";
import { MapPin } from "lucide-react";
import { getCategoryDisplay } from "@/utils/categories";

/**
 * EventBadges - Badges component for event card (category, past, external, online)
 */
const EventBadges = memo(function EventBadges({
  category,
  isPastEvent,
  isExternal,
  isOnline
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
        {getCategoryDisplay(category)}
      </span>
      <div className="flex items-center gap-2">
        {/* Past Event Badge */}
        {isPastEvent && (
          <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
            Свършило
          </span>
        )}
        {/* External Event Badge */}
        {isExternal && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            Външно събитие
          </span>
        )}
        {/* Online Badge */}
        {isOnline && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Онлайн
          </span>
        )}
      </div>
    </div>
  );
});

export default EventBadges;

