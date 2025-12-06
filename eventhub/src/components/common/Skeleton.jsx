/**
 * Skeleton - Loading placeholder component
 * 
 * Simple animated placeholder that pulses to indicate loading state.
 * 
 * @param {string} className - Additional CSS classes to apply
 */
export function Skeleton({ className = "" }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Зареждане..."
      role="status"
    />
  );
}

