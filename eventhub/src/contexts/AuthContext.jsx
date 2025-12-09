import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { usePersistedState } from "@/hooks/usePersistedState";

const USERS_API_URL = `${API_BASE_URL}/users`;

// Create the Auth Context
const AuthContext = createContext(null);

// AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = usePersistedState(null, "authUser");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Initialize auth state immediately on mount
  useEffect(() => {
    // Set isAuthenticated based on current user value
    setIsAuthenticated(!!user);
    // Force isAuthReady to true immediately (usePersistedState is synchronous)
    setIsAuthReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - user is already initialized from usePersistedState

  // Update isAuthenticated when user changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Safety timeout: Force isAuthReady to true after 1 second if still false
  // This prevents infinite loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Auth initialization timeout - forcing ready state");
        setIsAuthReady(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isAuthReady]);

  // Login function
  async function login(email, password) {
    try {
      // Fetch all users from the backend
      const response = await fetch(USERS_API_URL);
      
      if (!response.ok) {
        throw new Error("Грешка при зареждане на потребителите");
      }

      const users = await response.json();

      // Find user by email and password
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Невалиден email или парола");
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser;

      // Update state (automatically persisted by usePersistedState)
      setUser(userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register function
  async function register(userData) {
    try {
      // Check if email already exists
      const response = await fetch(USERS_API_URL);
      
      if (!response.ok) {
        throw new Error("Грешка при зареждане на потребителите");
      }

      const users = await response.json();
      const emailExists = users.some((u) => u.email === userData.email);

      if (emailExists) {
        throw new Error("Потребител с този email вече съществува");
      }

      // Create new user with required fields
      const newUserResponse = await fetch(USERS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          avatarUrl: "",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!newUserResponse.ok) {
        throw new Error("Грешка при регистрация");
      }

      const newUser = await newUserResponse.json();

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = newUser;

      // Update state (automatically persisted by usePersistedState)
      setUser(userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // Logout function
  function logout() {
    setUser(null);
  }

  // Update user in auth context (automatically persisted by usePersistedState)
  function updateUserInAuth(updatedUser) {
    setUser(updatedUser);
  }

  // Context value
  const value = {
    user,
    isAuthenticated,
    isAuthReady, // Expose auth ready state for route guards
    login,
    register,
    logout,
    updateUserInAuth, // Expose updateUserInAuth for external updates
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for easy access to auth context
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

