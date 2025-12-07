const API_BASE_URL = "http://localhost:5000/comments";

/**
 * Get all comments for a specific event, sorted by creation date (newest first)
 * 
 * @param {number|string} eventId - Event ID
 * @returns {Promise<Array>} List of comment objects sorted by createdAt descending
 */
export async function getCommentsByEvent(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}?eventId=${eventId}&_sort=createdAt&_order=desc`);
    
    if (!response.ok) {
      throw new Error(`Грешка при зареждане на коментарите: ${response.status} ${response.statusText}`);
    }

    const comments = await response.json();
    return comments;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при зареждане на коментарите";
    throw new Error(errorMessage);
  }
}

/**
 * Create a new comment
 * 
 * @param {Object} commentData - Comment data
 * @param {number|string} commentData.eventId - Event ID
 * @param {number|string} commentData.userId - User ID
 * @param {string} commentData.text - Comment text
 * @returns {Promise<Object>} Created comment object
 */
export async function createComment({ eventId, userId, text }) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: String(eventId),
        userId: Number(userId),
        text: text,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Грешка при създаване на коментар: ${response.status} ${response.statusText}`);
    }

    const comment = await response.json();
    return comment;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при създаване на коментар";
    throw new Error(errorMessage);
  }
}

/**
 * Get all comments by a specific user
 * 
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>} List of comment objects
 */
export async function getCommentsByUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при зареждане на коментарите: ${response.status} ${response.statusText}`);
    }

    const comments = await response.json();
    return comments;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при зареждане на коментарите";
    throw new Error(errorMessage);
  }
}

/**
 * Delete a comment by ID
 * 
 * @param {number|string} commentId - Comment ID to delete
 * @returns {Promise<boolean>} True if successful
 */
export async function deleteComment(commentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Грешка при изтриване на коментар: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при изтриване на коментар";
    throw new Error(errorMessage);
  }
}

