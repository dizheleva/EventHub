import Modal from "@/components/common/Modal";
import EventForm from "./EventForm";

export default function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  async function eventCreatedHandler(eventData) {
    // Pass event data to parent (EventList) which will handle API call
    // eventData already includes creatorId (set automatically by EventForm)
    // Await to properly handle async errors
    if (onEventCreated) {
      await onEventCreated(eventData);
    }
    // Note: Modal will be closed by EventList after successful creation
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

