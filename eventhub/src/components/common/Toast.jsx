import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

/**
 * Toast - Global toast notification component
 * 
 * Reads toast data from ToastContext (not via props)
 * Displays at bottom-right with smooth fade-in/out animation
 * Auto-hides after 3 seconds (handled by ToastProvider)
 */
export function Toast() {
  const { toast, hideToast } = useToast();

  if (!toast || !toast.message) return null;

  const { type, message } = toast;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
        type === "success"
          ? "bg-success text-white"
          : "bg-red-500 text-white"
      }`}
      role="alert"
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={hideToast}
        className="ml-2 p-1 rounded hover:bg-white/20 transition-colors flex-shrink-0"
        aria-label="Затвори"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

