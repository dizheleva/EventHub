import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/contexts/ToastContext";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { FormField } from "@/components/common/FormField";
import { validators } from "@/utils/validators";

/**
 * EditProfilePage - Edit user profile information
 * 
 * Only the profile owner can edit their own profile.
 * If userId !== current user.id, redirects to /events
 */
export function EditProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, isAuthReady, updateUser: updateAuthUser } = useAuth();
  const { user: profileUser, isLoading: isLoadingUser, error: userError, fetchUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatarUrl: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Load user profile data and check authorization
  useEffect(() => {
    if (!isAuthReady) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Prevent editing another user's profile
    if (currentUser?.id !== Number(userId)) {
      showToast("error", "Нямате права да редактирате този профил.");
      navigate("/events");
      return;
    }

    // Load user profile using useUser hook
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, currentUser, isAuthenticated, isAuthReady, navigate, showToast, fetchUser]);

  // Pre-fill form when user data is loaded
  useEffect(() => {
    if (profileUser) {
      setFormData({
        username: profileUser.username || "",
        email: profileUser.email || "",
        avatarUrl: profileUser.avatarUrl || "",
      });
    }
  }, [profileUser]);

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

  // Validate single field using validators.js
  function validateField(name, value) {
    const validator = validators[name];
    if (!validator) {
      return true; // No validator for this field
    }

    const error = validator(value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error || "",
    }));

    return !error;
  }

  // Validate entire form
  function validateForm() {
    const errors = {};
    let isValid = true;

    // Validate username
    const usernameError = validators.username(formData.username);
    if (usernameError) {
      errors.username = usernameError;
      isValid = false;
    }

    // Validate email
    const emailError = validators.email(formData.email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    // Validate avatarUrl (optional, but if provided must be valid URL)
    if (formData.avatarUrl && formData.avatarUrl.trim().length > 0) {
      const avatarUrlError = validators.avatarUrl(formData.avatarUrl);
      if (avatarUrlError) {
        errors.avatarUrl = avatarUrlError;
        isValid = false;
      }
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

      // Prepare update data (trim strings, handle empty avatarUrl)
      const updateData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        avatarUrl: formData.avatarUrl.trim() || "",
      };

      // Update user using useUser hook
      const updatedUser = await updateUser(userId, updateData);

      // Automatically update AuthContext.user
      updateAuthUser(updatedUser);

      // Show success toast
      showToast("success", "Профилът беше обновен успешно!");

      // Redirect to profile page
      navigate(`/profile/${userId}`);
    } catch (err) {
      const errorMessage = err.message || "Възникна грешка при обновяване на профила";
      showToast("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading while auth is initializing or profile is loading
  if (!isAuthReady || isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане на профил..." />
      </div>
    );
  }

  // Show error if profile failed to load
  if (userError && !profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage message={userError} onRetry={() => fetchUser(userId)} />
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
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Редактирай профил</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Username Field */}
          <div className="mb-6">
            <FormField
              label="Потребителско име"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.username}
              placeholder="Минимум 3 символа"
            />
          </div>

          {/* Email Field */}
          <div className="mb-6">
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
          </div>

          {/* Avatar URL Field */}
          <div className="mb-6">
            <FormField
              label="URL на аватар"
              name="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.avatarUrl}
              placeholder="https://example.com/avatar.jpg"
              optional={true}
            />
          </div>

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
      </article>
    </div>
  );
}
