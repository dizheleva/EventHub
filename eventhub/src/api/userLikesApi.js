const API_BASE_URL = "http://localhost:5000/userLikes";

/**
 * Get all likes for a specific user (where toUserId = userId)
 * 
 * @param {number|string} userId - User ID to get likes for
 * @returns {Promise<Array>} List of like objects
 */
export async function getUserLikes(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}?toUserId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при зареждане на харесванията: ${response.status} ${response.statusText}`);
    }

    const likes = await response.json();
    return likes;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при зареждане на харесванията";
    throw new Error(errorMessage);
  }
}

/**
 * Check if a user has liked another user
 * 
 * @param {number|string} fromUserId - User ID who gave the like
 * @param {number|string} toUserId - User ID who received the like
 * @returns {Promise<boolean>} True if the like exists, false otherwise
 */
export async function hasUserLiked(fromUserId, toUserId) {
  try {
    const response = await fetch(`${API_BASE_URL}?fromUserId=${fromUserId}&toUserId=${toUserId}`);
    
    if (!response.ok) {
      throw new Error(`Грешка при проверка на харесването: ${response.status} ${response.statusText}`);
    }

    const likes = await response.json();
    // Return true if any like exists, false otherwise
    return likes.length > 0;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при проверка на харесването";
    throw new Error(errorMessage);
  }
}

/**
 * Give a like from one user to another
 * 
 * @param {number|string} fromUserId - User ID who gives the like
 * @param {number|string} toUserId - User ID who receives the like
 * @returns {Promise<Object>} Created like object
 */
export async function giveLike(fromUserId, toUserId) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromUserId: Number(fromUserId),
        toUserId: Number(toUserId),
      }),
    });

    if (!response.ok) {
      throw new Error(`Грешка при добавяне на харесване: ${response.status} ${response.statusText}`);
    }

    const like = await response.json();
    return like;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при добавяне на харесване";
    throw new Error(errorMessage);
  }
}

/**
 * Remove a like from one user to another
 * 
 * @param {number|string} fromUserId - User ID who gave the like
 * @param {number|string} toUserId - User ID who received the like
 * @returns {Promise<boolean>} True if successful
 */
export async function removeLike(fromUserId, toUserId) {
  try {
    // First, find the like entry
    const findResponse = await fetch(`${API_BASE_URL}?fromUserId=${fromUserId}&toUserId=${toUserId}`);
    
    if (!findResponse.ok) {
      throw new Error(`Грешка при намиране на харесването: ${findResponse.status} ${findResponse.statusText}`);
    }

    const likes = await findResponse.json();
    
    if (likes.length === 0) {
      // Like doesn't exist, return true (already removed)
      return true;
    }

    // Get the first matching like (should only be one)
    const likeId = likes[0].id;

    // Delete the like by ID
    const deleteResponse = await fetch(`${API_BASE_URL}/${likeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!deleteResponse.ok) {
      throw new Error(`Грешка при премахване на харесването: ${deleteResponse.status} ${deleteResponse.statusText}`);
    }

    return true;
  } catch (err) {
    const errorMessage = err.message || "Възникна грешка при премахване на харесването";
    throw new Error(errorMessage);
  }
}

