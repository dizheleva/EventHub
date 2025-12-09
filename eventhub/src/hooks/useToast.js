import { toast } from "react-toastify";

/**
 * useToast - Custom hook for toast notifications using react-toastify
 * 
 * @returns {Object} { showToast }
 */
export function useToast() {
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

    if (type === "success") {
      toast.success(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (type === "error") {
      toast.error(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  return {
    showToast,
  };
}
