import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommentsByEvent,
  createComment as createCommentApi,
  deleteComment as deleteCommentApi,
} from "@/api/commentsApi";

/**
 * useComments - Custom hook for managing comments for an event
 * 
 * Provides functionality to:
 * - Load comments for an event
 * - Add new comments with optimistic UI
 * - Delete comments with optimistic UI (only for own comments)
 * 
 * @param {number|string} eventId - Event ID
 * @returns {Object} { comments, loading, error, loadComments, addComment, deleteComment }
 */
export function useComments(eventId) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load comments when component mounts or eventId changes
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  /**
   * Load comments for the event
   */
  async function loadComments() {
    if (!eventId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedComments = await getCommentsByEvent(eventId);
      setComments(loadedComments);
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при зареждане на коментарите";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Add a new comment with optimistic UI
   * 
   * @param {string} text - Comment text
   */
  async function addComment(text) {
    if (!user?.id) {
      throw new Error("Трябва да сте влезли в профила си, за да коментирате");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Коментарът не може да бъде празен");
    }

    // Create temporary comment for optimistic UI
    const tempId = "temp-" + Date.now();
    const tempComment = {
      id: tempId,
      eventId: String(eventId),
      userId: user.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      // Add user info for display (if available)
      user: user,
    };

    // Optimistically add comment to the beginning (newest first)
    setComments(prev => [tempComment, ...prev]);

    try {
      // Create comment on server
      const newComment = await createCommentApi({
        eventId: eventId,
        userId: user.id,
        text: text.trim(),
      });

      // Replace temporary comment with real one from server
      setComments(prev => prev.map(comment => 
        comment.id === tempId ? { ...newComment, user: user } : comment
      ));
    } catch (err) {
      // On error, remove optimistic comment
      setComments(prev => prev.filter(comment => comment.id !== tempId));
      
      const errorMessage = err.message || "Възникна грешка при добавяне на коментар";
      setError(errorMessage);
      throw err;
    }
  }

  /**
   * Delete a comment with optimistic UI
   * Only allows deletion if the comment belongs to the current user
   * 
   * @param {number|string} commentId - Comment ID to delete
   */
  async function deleteComment(commentId) {
    if (!user?.id) {
      throw new Error("Трябва да сте влезли в профила си");
    }

    // Find the comment to delete
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) {
      throw new Error("Коментарът не беше намерен");
    }

    // Check if user owns this comment
    if (commentToDelete.userId !== user.id) {
      throw new Error("Нямате права да изтриете този коментар");
    }

    // Store backup for rollback
    const commentsBackup = [...comments];

    // Optimistically remove comment
    setComments(prev => prev.filter(comment => comment.id !== commentId));

    try {
      // Delete comment on server
      await deleteCommentApi(commentId);
      // Success - comment is already removed (optimistic update)
    } catch (err) {
      // On error, restore backup
      setComments(commentsBackup);
      
      const errorMessage = err.message || "Възникна грешка при изтриване на коментар";
      setError(errorMessage);
      throw err;
    }
  }

  return {
    comments,
    loading,
    error,
    loadComments,
    addComment,
    deleteComment,
  };
}

