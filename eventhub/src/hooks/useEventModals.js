import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

/**
 * Custom hook for managing event modals (create, edit, delete)
 * @param {Array} events - Events array (for authorization checks)
 * @returns {Object} Modal state and handlers
 */
export function useEventModals(events = []) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  
  // Modal states
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Authorization check before opening edit modal
  const openEditModal = useCallback(async (eventId) => {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Check if user is the author (creator) - authorization check
    // Support both creatorId (new) and userId (legacy) for backward compatibility
    try {
      const event = events.find(e => e.id === eventId);
      const eventCreatorId = event?.creatorId || event?.userId;
      if (event && eventCreatorId !== user?.id) {
        // User is NOT the owner - prevent unauthorized access
        showToast("error", "Нямате права да редактирате това събитие");
        return; // Prevent opening modal for non-owners
      }
    } catch (err) {
      console.error("Error checking event ownership:", err);
    }

    // User is authorized - open edit modal
    setSelectedEventId(eventId);
    setShowEditModal(true);
  }, [isAuthenticated, events, user, showToast]);
  
  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedEventId(null);
  }, []);
  
  // Authorization check before opening delete modal
  const openDeleteModal = useCallback((event) => {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }

    // Check if user is the author (creator) - authorization check
    // Support both creatorId (new) and userId (legacy) for backward compatibility
    const eventCreatorId = event.creatorId;
    if (eventCreatorId !== user?.id) {
      // User is NOT the owner - prevent unauthorized access
      showToast("error", "Нямате права да изтривате това събитие");
      return; // Prevent opening modal for non-owners
    }

    // User is authorized - open delete modal
    setDeletingEventId(event.id);
    setIsDeleteModalOpen(true);
  }, [isAuthenticated, user, showToast]);
  
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingEventId(null);
  }, []);
  
  const openCreateModal = useCallback(() => {
    if (!isAuthenticated) {
      showToast("error", "Моля, влезте в профила си.");
      return;
    }
    setShowCreateModal(true);
  }, [isAuthenticated, showToast]);
  
  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);
  
  return {
    // Modal states
    selectedEventId,
    isEditModalOpen: showEditModal,
    isDeleteModalOpen,
    deletingEventId,
    isCreateModalOpen: showCreateModal,
    
    // Handlers
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openCreateModal,
    closeCreateModal
  };
}

