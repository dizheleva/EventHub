import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Wait for auth to be ready before making redirect decisions
  useEffect(() => {
    // Only check authentication and redirect if auth is ready
    if (isAuthReady && !isAuthenticated) {
      // Show toast notification
      showToast("error", "Моля, влезте в акаунта си.");

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
  }, [isAuthenticated, isAuthReady, navigate, location, redirectTo, showToast]);

  // isAuthReady should be true immediately, but add timeout fallback
  // Show loading spinner while auth is initializing (with timeout to prevent infinite loading)
  const [forceReady, setForceReady] = useState(false);
  
  useEffect(() => {
    // Force ready after 500ms if still not ready (safety fallback)
    const timeout = setTimeout(() => {
      if (!isAuthReady) {
        setForceReady(true);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [isAuthReady]);

  if (!isAuthReady && !forceReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане..." />
      </div>
    );
  }

  // If not authenticated (and auth is ready), don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return children;
}

