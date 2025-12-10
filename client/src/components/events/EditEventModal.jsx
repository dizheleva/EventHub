import { useState } from "react";
import Modal from "../common/Modal";
import EditEventForm from "./EditEventForm";

export default function EditEventModal({ isOpen, onClose, eventId, onEventUpdated }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEventUpdated = async (eventData) => {
        setIsSubmitting(true);
        try {
            if (onEventUpdated) {
                await onEventUpdated(eventData);
            }
            onClose();
        } catch (error) {
            console.error("Error updating event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Редактирай събитие"
        >
            <EditEventForm 
                eventId={eventId}
                onEventUpdated={handleEventUpdated}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
}

