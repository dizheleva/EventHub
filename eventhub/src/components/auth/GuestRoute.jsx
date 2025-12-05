import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

/**
 * GuestRoute - Route guard for guest-only routes (login, register)
 * 
 * Waits for auth to be ready before making decisions:
 *   - Shows LoadingSpinner while auth is initializing
 *   - If user IS logged in → redirects to /events
 *   - If user is NOT logged in → renders children normally
 * 
 * @param {React.ReactNode} children - Content to render if not authenticated
 * @param {string} redirectTo - Custom redirect path for authenticated users (default: "/events")
 */
export function GuestRoute({ children, redirectTo = "/events" }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();

  // Wait for auth to be ready before making redirect decisions
  useEffect(() => {
    // Only check authentication and redirect if auth is ready
    if (isAuthReady && isAuthenticated) {
      // If user is already authenticated, redirect to events page
      // This prevents logged-in users from accessing login/register pages
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isAuthReady, navigate, redirectTo]);

  // Show loading spinner while auth is initializing
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане..." />
      </div>
    );
  }

  // If authenticated (and auth is ready), don't render children (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated, render children (allow access to login/register)
  return children;
}

