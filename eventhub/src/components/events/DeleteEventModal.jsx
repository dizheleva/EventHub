import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Toast } from "@/components/common/Toast";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteEventModal({ eventId, isOpen, onClose, onDeleted }) {
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
      const res = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = "Грешка при изтриване на събитие";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        errorMessage = `Грешка ${res.status}: ${errorMessage}`;
        throw new Error(errorMessage);
      }

      // Show success toast
      setToast({
        type: "success",
        message: "Събитието беше изтрито успешно!",
      });

      // Call callback
      if (onDeleted) {
        onDeleted(eventId);
      }

      // Close modal after successful deletion
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        setToast(null);
      }, 1500);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при изтриване на събитие",
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

