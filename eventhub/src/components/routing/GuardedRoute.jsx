import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Toast } from "@/components/common/Toast";

export function GuardedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Show toast message
      setShowToast(true);

      // Redirect to login after showing toast
      const redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 500);

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, show toast and don't render children
  if (!isAuthenticated) {
    return (
      <>
        {showToast && (
          <Toast
            type="error"
            message="Моля, влезте в профила си."
          />
        )}
      </>
    );
  }

  // If authenticated, render children
  return children;
}

