import { createContext, useContext, useState, useEffect } from "react";

// Create the Auth Context
const AuthContext = createContext(null);

// AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false); // Loading state for auth initialization

  // Load user from localStorage on app start
  // This ensures auth state is restored before rendering protected routes
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        try {
          // Safely parse user data from localStorage
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (parseError) {
          // If parsing fails, remove corrupted data
          console.error("Error parsing stored user:", parseError);
          localStorage.removeItem("authUser");
        }
      }
    } catch (error) {
      // If localStorage access fails, log error but continue
      console.error("Error accessing localStorage:", error);
    } finally {
      // Mark auth as ready after checking localStorage
      setIsAuthReady(true);
    }
  }, []);

  // Login function
  async function login(email, password) {
    try {
      // Fetch all users from the backend
      const response = await fetch("http://localhost:5000/users");
      
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

      // Update state
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      // Save user to localStorage under "authUser" key for persistence
      localStorage.setItem("authUser", JSON.stringify(userWithoutPassword));

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
      const response = await fetch("http://localhost:5000/users");
      
      if (!response.ok) {
        throw new Error("Грешка при зареждане на потребителите");
      }

      const users = await response.json();
      const emailExists = users.some((u) => u.email === userData.email);

      if (emailExists) {
        throw new Error("Потребител с този email вече съществува");
      }

      // Create new user with required fields
      const newUserResponse = await fetch("http://localhost:5000/users", {
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

      // Update state
      setUser(userWithoutPassword);
      setIsAuthenticated(true);

      // Save user to localStorage under "authUser" key for persistence
      localStorage.setItem("authUser", JSON.stringify(userWithoutPassword));

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // Logout function
  function logout() {
    setUser(null);
    setIsAuthenticated(false);
    // Remove user from localStorage on logout
    localStorage.removeItem("authUser");
  }

  // Context value
  const value = {
    user,
    isAuthenticated,
    isAuthReady, // Expose auth ready state for route guards
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for easy access to auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

