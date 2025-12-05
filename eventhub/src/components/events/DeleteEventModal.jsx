import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Toast } from "@/components/common/Toast";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DeleteEventModal({ eventId, isOpen, onClose, onDeleted, onError, deleteEvent }) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  async function deleteHandler() {
    if (!eventId) {
      setToast({
        type: "error",
        message: "Грешка: Липсва ID на събитието",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsDeleting(true);

    try {
      // First, fetch the event to check ownership
      const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
      if (!eventResponse.ok) {
        throw new Error("Грешка при зареждане на събитието");
      }
      const event = await eventResponse.json();

      // Check if current user is the author (creator)
      // Support both creatorId (new) and userId (legacy) for backward compatibility
      const eventCreatorId = event.creatorId || event.userId;
      if (user && eventCreatorId !== user.id) {
        setToast({
          type: "error",
          message: "Нямате право да изтриете това събитие.",
        });
        setTimeout(() => {
          setToast(null);
          if (onClose) onClose();
        }, 2000);
        setIsDeleting(false);
        return;
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
      setToast({
        type: "success",
        message: "Събитието беше изтрито успешно!",
      });

      // Close modal after successful deletion
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        setToast(null);
      }, 1500);
    } catch (err) {
      // Call onError callback for additional error handling
      if (onError) {
        onError(eventId, err);
      }
      // Show error toast
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при изтриване на събитие. Събитието беше възстановено.",
      });
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

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

