import { useState, useEffect } from "react";

/**
 * Custom hook for managing event image loading state
 * @param {string} imageUrl - The image URL
 * @param {string} eventId - The event ID (for resetting state on event change)
 * @returns {Object} Image loading state and handlers
 */
export function useEventImage(imageUrl, eventId) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!imageUrl);

  // Reset image error and loading when imageUrl or event.id changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(!!imageUrl);
  }, [imageUrl, eventId]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  return {
    imageLoading,
    imageError,
    onError: handleImageError,
    onLoad: handleImageLoad
  };
}

