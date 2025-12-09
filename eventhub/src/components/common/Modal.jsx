import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  // Handle ESC key to close modal and body scroll
  useEffect(() => {
    if (!isOpen) {
      // Ensure body scroll is restored when modal is closed
      document.body.style.overflow = "";
      return;
    }

    function escapeHandler(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", escapeHandler);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", escapeHandler);
      // Always restore body scroll on cleanup
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Cleanup on unmount to ensure body scroll is restored
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isOpen) {
    // Ensure no overlay remains when modal is closed
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          {title && (
            <h2
              id="modal-title"
              className="text-2xl font-bold text-gray-900"
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Затвори"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

