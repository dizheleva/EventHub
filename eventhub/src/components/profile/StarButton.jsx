import { Star } from "lucide-react";

/**
 * StarButton - Reusable component for liking/unliking users
 * 
 * @param {Object} props
 * @param {boolean} props.isLiked - Whether the user is currently liked
 * @param {Function} props.onToggle - Callback function when button is clicked
 * @param {boolean} props.disabled - Whether the button is disabled
 */
export function StarButton({ isLiked, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={isLiked ? "Премахни харесване" : "Дай харесване"}
      aria-pressed={isLiked}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-xl font-medium 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2
        ${
          isLiked
            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-2 border-yellow-300 focus-visible:outline-yellow-500"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300 focus-visible:outline-gray-500"
        }
      `}
    >
      {isLiked ? (
        <>
          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" aria-hidden="true" />
          <span>⭐ Liked</span>
        </>
      ) : (
        <>
          <Star className="w-5 h-5" aria-hidden="true" />
          <span>☆ Give star</span>
        </>
      )}
    </button>
  );
}

