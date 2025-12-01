import { Modal } from "@/components/common/Modal";
import { EventForm } from "./EventForm";

export function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  function eventCreatedHandler(newEvent) {
    if (onEventCreated) {
      onEventCreated(newEvent);
    }
    // Close modal after success
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 1500);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добави събитие"
    >
      <EventForm
        mode="create"
        onEventCreated={eventCreatedHandler}
        onClose={onClose}
      />
    </Modal>
  );
}

