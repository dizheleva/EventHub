import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Toast } from "@/components/common/Toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

/**
 * ProtectedRoute - Route guard for authenticated routes
 * 
 * Waits for auth to be ready before making decisions:
 *   - Shows LoadingSpinner while auth is initializing
 *   - If user is NOT logged in → redirects to login page
 *   - If user IS logged in → renders children normally
 * 
 * @param {React.ReactNode} children - Content to render if authenticated
 * @param {string} redirectTo - Custom redirect path (default: "/login")
 */
export function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);

  // Wait for auth to be ready before making redirect decisions
  useEffect(() => {
    // Only check authentication and redirect if auth is ready
    if (isAuthReady && !isAuthenticated) {
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
  }, [isAuthenticated, isAuthReady, navigate, location, redirectTo]);

  // Show loading spinner while auth is initializing
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане..." />
      </div>
    );
  }

  // If not authenticated (and auth is ready), show toast and don't render children
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

