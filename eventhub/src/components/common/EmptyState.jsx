import { memo } from "react";
import { Calendar } from "lucide-react";

/**
 * EmptyState - Reusable empty state component
 * 
 * Displays a friendly message when there's no content to show.
 * Supports optional icon (emoji or React component), title, message, and action button.
 * 
 * @param {string} title - Main title text
 * @param {string} message - Descriptive message text
 * @param {string|React.Component} icon - Optional icon (emoji string or React component)
 * @param {React.ReactNode} action - Optional action button or element
 */
export const EmptyState = memo(function EmptyState({ title, message, icon, action }) {
  // Default icon if none provided
  const defaultIcon = <Calendar className="w-16 h-16 text-primary/40" />;
  
  // Determine if icon is an emoji string or React component
  const renderIcon = () => {
    if (!icon) {
      return defaultIcon;
    }
    
    // If icon is a string (emoji), render it as text
    if (typeof icon === "string") {
      return (
        <div className="text-6xl mb-4" role="img" aria-label={icon}>
          {icon}
        </div>
      );
    }
    
    // If icon is a React component, render it
    return <div className="mb-4">{icon}</div>;
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full text-center">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {renderIcon()}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action Button (optional) */}
          {action && (
            <div className="mt-6">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

