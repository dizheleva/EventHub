import { useState } from "react";
import Modal from "../common/Modal";
import EditProfileForm from "./EditProfileForm";

export default function EditProfileModal({ isOpen, onClose, userId, onProfileUpdated }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleProfileUpdated = async (profileData) => {
        setIsSubmitting(true);
        try {
            if (onProfileUpdated) {
                await onProfileUpdated(profileData);
            }
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Редактирай профил"
        >
            <EditProfileForm 
                userId={userId}
                onProfileUpdated={handleProfileUpdated}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
}

