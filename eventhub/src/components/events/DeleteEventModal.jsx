import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { API_BASE_URL } from "@/config/api";

const EVENTS_API_URL = `${API_BASE_URL}/events`;

export function DeleteEventModal({ eventId, isOpen, onClose, onDeleted, onError, deleteEvent }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteHandler() {
    if (!eventId) {
      showToast("error", "Грешка: Липсва ID на събитието");
      return;
    }

    setIsDeleting(true);

    try {
      // First, fetch the event to check ownership
      const eventResponse = await fetch(`${EVENTS_API_URL}/${eventId}`);
      if (!eventResponse.ok) {
        throw new Error("Грешка при зареждане на събитието");
      }
      const event = await eventResponse.json();

      // Authorization check: Verify current user is the owner (creator) of this event
      // Support both creatorId (new) and userId (legacy) for backward compatibility
      const eventCreatorId = event.creatorId || event.userId;
      if (user && eventCreatorId !== user.id) {
        // User is NOT the owner - prevent unauthorized deletion
        // Close modal immediately and show error message
        // Do NOT make backend call when unauthorized
        showToast("error", "Нямате права да изтривате това събитие");
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
        setIsDeleting(false);
        return; // Prevent backend call - do NOT allow deletion
      }

      // Use deleteEvent from hook (handles optimistic update and revert on error)
      if (!deleteEvent) {
        throw new Error("deleteEvent function is not provided");
      }
      
      await deleteEvent(eventId);

      // Call onDeleted callback for any additional handling
      if (onDeleted) {
        onDeleted();
      }

      // Show success toast
      showToast("success", "Събитието беше изтрито успешно!");

      // Close modal after successful deletion
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (err) {
      // Call onError callback for additional error handling
      if (onError) {
        onError(eventId, err);
      }
      // Show error toast
      showToast("error", err.message || "Възникна грешка при изтриване на събитие. Събитието беше възстановено.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Изтриване на събитие"
      >
        <div className="space-y-6">
          {/* Confirmation Text */}
          <p className="text-gray-700">
            Сигурни ли сте, че искате да изтриете това събитие? Това действие не може да бъде отменено.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-xl font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={isDeleting}
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={deleteHandler}
              disabled={isDeleting}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isDeleting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg"
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Изтриване...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Изтрий</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

