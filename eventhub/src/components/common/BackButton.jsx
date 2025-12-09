import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * BackButton - Reusable back button component
 * 
 * Displays a back button that can navigate to a specific route or go back in history.
 * 
 * @param {string} to - Route to navigate to (if provided, uses Link)
 * @param {function} onClick - Custom onClick handler (if provided, uses button with handler)
 * @param {string} text - Button text (default: "Върни се обратно")
 * @param {string} className - Additional CSS classes (if starts with custom styles, only those are used)
 * @param {boolean} useHistory - If true and no 'to' prop, uses browser history back
 * @param {boolean} noDefaultStyles - If true, only uses className without default styles
 */
export const BackButton = memo(function BackButton({ 
  to,
  onClick,
  text = "Върни се обратно",
  className = "",
  useHistory = false,
  noDefaultStyles = false
}) {
  const navigate = useNavigate();
  
  const defaultClassName = "flex items-center gap-2 text-gray-600 hover:text-primary transition-colors";
  const combinedClassName = noDefaultStyles 
    ? className 
    : `${defaultClassName} ${className}`.trim();

  // If onClick is provided, use button with custom handler
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={combinedClassName}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">{text}</span>
      </button>
    );
  }

  // If 'to' is provided, use Link for navigation
  if (to) {
    return (
      <Link
        to={to}
        className={combinedClassName}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">{text}</span>
      </Link>
    );
  }

  // If useHistory is true, go back in browser history
  if (useHistory) {
    return (
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={combinedClassName}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">{text}</span>
      </button>
    );
  }

  // Default: navigate to home
  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className={combinedClassName}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{text}</span>
    </button>
  );
});

