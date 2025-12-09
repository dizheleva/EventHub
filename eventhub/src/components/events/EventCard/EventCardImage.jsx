import { memo } from "react";
import { Calendar } from "lucide-react";

/**
 * EventImage - Image component for event card
 */
const EventImage = memo(function EventImage({
  imageUrl,
  title,
  imageLoading,
  imageError,
  onLoad,
  onError,
  favoriteButton,
  interestsBadge
}) {
  return (
    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
      {imageUrl && !imageError ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
              <Calendar className="w-12 h-12 text-primary/40 animate-pulse" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
            onError={onError}
            onLoad={onLoad}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Calendar className="w-16 h-16 text-primary/60" />
        </div>
      )}
      {favoriteButton}
      {interestsBadge}
    </div>
  );
});

export default EventImage;

