import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

/**
 * EventAuthor - Author component for event card
 */
const EventAuthor = memo(function EventAuthor({
  eventCreatorId,
  authorName,
  authorLikesCount,
  isLoadingAuthor
}) {
  if (!eventCreatorId) return null;

  return (
    <div className="pt-3 border-t border-gray-100 mt-auto">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Автор:</span>
        <Link
          to={`/profile/${eventCreatorId}`}
          className="text-sm text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1.5"
        >
          {isLoadingAuthor ? (
            <span className="text-gray-400">Зареждане...</span>
          ) : (
            <>
              <span>{authorName || "Неизвестен"}</span>
              {authorLikesCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Heart className="w-3 h-3 fill-yellow-600" />
                  <span className="text-xs">{authorLikesCount}</span>
                </span>
              )}
            </>
          )}
        </Link>
      </div>
    </div>
  );
});

export default EventAuthor;

