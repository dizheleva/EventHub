import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Toast } from "@/components/common/Toast";

/**
 * ProtectedRoute - Route guard for authenticated routes
 * 
 * If user is NOT logged in:
 *   - Redirects to login page (or custom redirectTo)
 *   - Preserves original URL in query parameter (?redirect=/original-path)
 *   - Shows toast notification
 * 
 * If user IS logged in:
 *   - Renders children normally
 * 
 * @param {React.ReactNode} children - Content to render if authenticated
 * @param {string} redirectTo - Custom redirect path (default: "/login")
 */
export function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Show toast notification
      setShowToast(true);

      // Preserve original URL in query parameter for redirect after login
      const currentPath = location.pathname + location.search;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;

      // Redirect to login page with original URL preserved
      const redirectTimer = setTimeout(() => {
        navigate(redirectUrl);
      }, 500);

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [isAuthenticated, navigate, location, redirectTo]);

  // If not authenticated, show toast and don't render children
  if (!isAuthenticated) {
    return (
      <>
        {showToast && (
          <Toast
            type="error"
            message="Моля, влезте в акаунта си."
          />
        )}
      </>
    );
  }

  // If authenticated, render children
  return children;
}

