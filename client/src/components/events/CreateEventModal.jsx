import { useState } from "react";
import Modal from "../common/Modal";
import EventCreateForm from "./EventCreateForm";

export default function CreateEventModal({ isOpen, onClose, onEventCreated }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEventCreated = async (eventData) => {
        setIsSubmitting(true);
        try {
            if (onEventCreated) {
                await onEventCreated(eventData);
            }
            onClose();
        } catch (error) {
            console.error("Error creating event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Създай ново събитие"
        >
            <EventCreateForm 
                onEventCreated={handleEventCreated}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
}

