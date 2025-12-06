import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { FormField } from "@/components/common/FormField";

// Email validation function
function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * EditProfilePage - Edit user profile information
 * 
 * Only the profile owner can edit their own profile.
 * If userId !== current user.id, redirects to /events
 */
export function EditProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthReady, login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Load user profile data
  useEffect(() => {
    if (!isAuthReady) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // If userId doesn't match current user, redirect to events
    if (userId !== String(user?.id)) {
      showToast("error", "Нямате права да редактирате този профил.");
      navigate("/events");
      return;
    }

    // Load user profile
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:5000/users/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Потребителят не е намерен");
          }
          throw new Error(`Грешка при зареждане на профила: ${response.status}`);
        }

        const userData = await response.json();
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
        });
      } catch (err) {
        const errorMessage = err.message || "Възникна грешка при зареждане на профила";
        setError(errorMessage);
        showToast("error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId, user, isAuthenticated, isAuthReady, navigate, showToast]);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  // Handle blur for validation
  function handleBlur(e) {
    const { name, value } = e.target;
    validateField(name, value);
  }

  // Validate single field
  function validateField(name, value) {
    let error = "";

    switch (name) {
      case "email":
        if (!value) {
          error = "Имейлът е задължителен";
        } else if (!validateEmail(value)) {
          error = "Невалиден имейл адрес";
        }
        break;
      case "name":
        if (!value || value.trim().length === 0) {
          error = "Името е задължително";
        } else if (value.trim().length < 2) {
          error = "Името трябва да е поне 2 символа";
        }
        break;
      default:
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  }

  // Validate entire form
  function validateForm() {
    const errors = {};
    let isValid = true;

    // Validate email
    if (!formData.email) {
      errors.email = "Имейлът е задължителен";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Невалиден имейл адрес";
      isValid = false;
    }

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = "Името е задължително";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Името трябва да е поне 2 символа";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", "Моля, попълнете всички полета правилно.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if email is already taken by another user
      const usersResponse = await fetch("http://localhost:5000/users");
      if (!usersResponse.ok) {
        throw new Error("Грешка при проверка на имейла");
      }
      const allUsers = await usersResponse.json();
      const emailExists = allUsers.some(
        (u) => u.email === formData.email && u.id !== Number(userId)
      );

      if (emailExists) {
        setFormErrors({ email: "Потребител с този имейл вече съществува" });
        showToast("error", "Потребител с този имейл вече съществува");
        setIsSubmitting(false);
        return;
      }

      // Update user profile
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: Number(userId),
          // Keep password if it exists (don't update it)
          password: user?.password || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Грешка при обновяване на профила: ${response.status}`);
      }

      await response.json();

      // Update auth context with new user data
      // Re-login to update the user in context and localStorage
      await login(formData.email, user?.password || "");

      showToast("success", "Профилът беше обновен успешно!");
      navigate(`/profile/${userId}`);
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при обновяване на профила";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading while auth is initializing or profile is loading
  if (!isAuthReady || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане на профил..." />
      </div>
    );
  }

  // Show error if profile failed to load (only if we haven't loaded any data yet)
  if (error && isLoading === false && !formData.email && !formData.name) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/profile/${userId}`)}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Назад към профила</span>
      </button>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Редактирай профил</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Name Field */}
          <FormField
            label="Име"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.name}
            placeholder="Въведете вашето име"
          />

          {/* Email Field */}
          <FormField
            label="Имейл"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.email}
            placeholder="Въведете вашия имейл"
          />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(`/profile/${userId}`)}
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner message="" />
                  Запазване...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Запази промените
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

