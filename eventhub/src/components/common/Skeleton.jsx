/**
 * Skeleton - Loading placeholder component
 */
export default function Skeleton({ className = "" }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Зареждане..."
      role="status"
    />
  );
}

