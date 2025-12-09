import { memo } from "react";

const LoadingSpinner = memo(function LoadingSpinner({ message = "Зареждане...", variant = "default" }) {
  const containerClasses = variant === "inline" 
    ? "text-center py-4 text-gray-600 mb-4"
    : "text-center py-20";
  
  return (
    <div className={containerClasses}>
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
});

export default LoadingSpinner;

