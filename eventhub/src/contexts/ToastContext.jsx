import { createContext, useContext, useState, useEffect } from "react";

// Create the Toast Context
const ToastContext = createContext(null);

/**
 * ToastProvider - Global toast notification provider
 * 
 * Provides toast functionality throughout the entire application.
 * Toast automatically hides after 3 seconds.
 * 
 * @param {React.ReactNode} children - App components
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [toast]);

  /**
   * Show toast notification
   * @param {string} type - Toast type: "success" or "error"
   * @param {string} message - Toast message to display
   */
  function showToast(type, message) {
    if (!type || !message) {
      console.warn("Toast requires both type and message");
      return;
    }
    setToast({ type, message });
  }

  /**
   * Hide toast notification
   */
  function hideToast() {
    setToast(null);
  }

  // Context value
  const value = {
    toast,
    showToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast - Custom hook to access toast functionality
 * 
 * @returns {Object} { toast, showToast, hideToast }
 * @throws {Error} If used outside ToastProvider
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

