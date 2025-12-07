import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserLikes, hasUserLiked as checkHasUserLiked, giveLike, removeLike } from "@/api/userLikesApi";

const API_BASE_URL = "http://localhost:5000/users";

/**
 * useUser - Custom hook for user operations
 * 
 * Provides functionality to fetch and update user data.
 * Compatible with AuthContext user object structure.
 * 
 * @returns {Object} { user, isLoading, error, fetchUser, updateUser, likesCount, hasUserLiked, toggleLike }
 */
export function useUser() {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [hasUserLiked, setHasUserLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  /**
   * Fetch user by ID
   * 
   * @param {number|string} userId - User ID to fetch
   * @returns {Promise<Object>} User object (without password)
   */
  async function fetchUser(userId) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Потребителят не е намерен");
        }
        throw new Error(`Грешка при зареждане на потребителя: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();

      // Remove password from user object for security
      const { password: _, ...userWithoutPassword } = userData;

      setUser(userWithoutPassword);

      // Load likes for this user
      try {
        const likes = await getUserLikes(Number(userId));
        setLikesCount(likes.length);

        // Check if current user has liked this profile
        if (currentUser?.id && Number(userId) !== currentUser.id) {
          const liked = await checkHasUserLiked(currentUser.id, Number(userId));
          setHasUserLiked(liked);
        } else {
          setHasUserLiked(false);
        }
      } catch (likesError) {
        // Don't fail the whole fetch if likes fail
        console.error("Error loading likes:", likesError);
        setLikesCount(0);
        setHasUserLiked(false);
      }

      return userWithoutPassword;
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при зареждане на потребителя";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Update user by ID
   * 
   * @param {number|string} userId - User ID to update
   * @param {Object} data - User data to update (will not include password)
   * @returns {Promise<Object>} Updated user object (without password)
   */
  async function updateUser(userId, data) {
    setError(null);
    setIsLoading(true);

    try {
      // Fetch current user to preserve password
      const currentUserResponse = await fetch(`${API_BASE_URL}/${userId}`);
      
      if (!currentUserResponse.ok) {
        throw new Error(`Грешка при зареждане на потребителя: ${currentUserResponse.status}`);
      }

      const currentUser = await currentUserResponse.json();

      // Prepare update data - preserve password and id
      const updateData = {
        ...currentUser,
        ...data,
        id: Number(userId),
        // If password is provided in data, use it; otherwise preserve current password
        password: data.password || currentUser.password || "",
      };

      const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Грешка при обновяване на потребителя: ${response.status} ${response.statusText}`);
      }

      const updatedUser = await response.json();

      // Remove password from updated user object for security
      const { password: _, ...userWithoutPassword } = updatedUser;

      setUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при обновяване на потребителя";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Toggle like/unlike for the current user profile
   * Uses optimistic UI updates
   * 
   * @returns {Promise<void>}
   */
  async function toggleLike() {
    if (!currentUser?.id || !user || isTogglingLike) {
      return;
    }

    // Don't allow liking own profile
    if (Number(user.id) === currentUser.id) {
      return;
    }

    setIsTogglingLike(true);
    const previousLiked = hasUserLiked;
    const previousLikesCount = likesCount;

    // Optimistic update
    setHasUserLiked(!previousLiked);
    setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);

    try {
      if (previousLiked) {
        await removeLike(currentUser.id, Number(user.id));
      } else {
        await giveLike(currentUser.id, Number(user.id));
      }

      // Reload likes to get fresh data from server
      const updatedLikes = await getUserLikes(Number(user.id));
      setLikesCount(updatedLikes.length);
      setHasUserLiked(!previousLiked);
    } catch (err) {
      // Rollback on error
      setHasUserLiked(previousLiked);
      setLikesCount(previousLikesCount);
      throw err;
    } finally {
      setIsTogglingLike(false);
    }
  }

  return {
    user,
    isLoading,
    error,
    fetchUser,
    updateUser,
    likesCount,
    hasUserLiked,
    toggleLike,
    isTogglingLike,
  };
}

