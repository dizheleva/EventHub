import { createContext, useContext, useState, useEffect } from "react";

// Create the Auth Context
const AuthContext = createContext(null);

// AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
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

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

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

      // Create new user
      const newUserResponse = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

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
    localStorage.removeItem("user");
  }

  // Context value
  const value = {
    user,
    isAuthenticated,
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

