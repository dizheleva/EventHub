import { useState } from "react";

const API_BASE_URL = "http://localhost:5000/users";

/**
 * useUser - Custom hook for user operations
 * 
 * Provides functionality to fetch and update user data.
 * Compatible with AuthContext user object structure.
 * 
 * @returns {Object} { user, isLoading, error, fetchUser, updateUser }
 */
export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
        // Ensure password is preserved
        password: currentUser.password || "",
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

  return {
    user,
    isLoading,
    error,
    fetchUser,
    updateUser,
  };
}

