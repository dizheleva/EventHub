import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * GuestRoute - Route guard for guest-only routes (login, register)
 * 
 * If user IS logged in:
 *   - Redirects to /events (or custom redirectTo)
 *   - Prevents authenticated users from accessing guest pages
 * 
 * If user is NOT logged in:
 *   - Renders children normally (allows access to login/register)
 * 
 * @param {React.ReactNode} children - Content to render if not authenticated
 * @param {string} redirectTo - Custom redirect path for authenticated users (default: "/events")
 */
export function GuestRoute({ children, redirectTo = "/events" }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to events page
    // This prevents logged-in users from accessing login/register pages
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // If authenticated, don't render children (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated, render children (allow access to login/register)
  return children;
}

