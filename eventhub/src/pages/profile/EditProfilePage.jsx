import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/contexts/ToastContext";
import { API_BASE_URL } from "@/config/api";

const USERS_API_URL = `${API_BASE_URL}/users`;
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
  const { user: currentUser, isAuthenticated, isAuthReady, updateUserInAuth } = useAuth();
  const { user: profileUser, isLoading: isLoadingUser, error: userError, fetchUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatarUrl: "",
    password: "",
    confirmPassword: "",
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

    // Wait for currentUser to be available
    if (!currentUser) {
      return;
    }

    // Prevent editing another user's profile
    const userIdNum = Number(userId);
    if (currentUser.id !== userIdNum) {
      showToast("error", "Нямате права да редактирате този профил.");
      navigate("/events");
      return;
    }

    // Load user profile using useUser hook only if authorized
    if (userId && currentUser.id === userIdNum) {
      fetchUser(userId).catch((err) => {
        console.error("Error fetching user:", err);
        // Error is handled by useUser hook
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser?.id, isAuthenticated, isAuthReady]);

  // Pre-fill form when user data is loaded
  useEffect(() => {
    if (profileUser) {
      setFormData({
        username: profileUser.username || "",
        email: profileUser.email || "",
        avatarUrl: profileUser.avatarUrl || "",
        password: "", // Password fields are always empty (not pre-filled for security)
        confirmPassword: "",
      });
    }
  }, [profileUser]);

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(newFormData);
    
    // For password fields, validate immediately without clearing error first
    if (name === "password") {
      // If password changes, re-validate confirmPassword immediately if it has a value
      if (newFormData.confirmPassword && newFormData.confirmPassword.trim().length > 0) {
        const confirmError = validators.confirmPassword(value, newFormData.confirmPassword);
        setFormErrors(prev => {
          if (confirmError) {
            return { ...prev, confirmPassword: confirmError };
          }
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
      // Clear password error when user starts typing
      if (formErrors.password) {
        setFormErrors(prev => ({
          ...prev,
          password: "",
        }));
      }
    } else if (name === "confirmPassword") {
      // If confirmPassword changes, validate it immediately against password
      if (newFormData.password && newFormData.password.trim().length > 0) {
        const confirmError = validators.confirmPassword(newFormData.password, value);
        setFormErrors(prev => {
          if (confirmError) {
            return { ...prev, confirmPassword: confirmError };
          }
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      } else {
        // Clear confirmPassword error if password is not set
        if (formErrors.confirmPassword) {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
      }
    } else {
      // For other fields, clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  }

  // Handle blur for validation
  function handleBlur(e) {
    const { name, value } = e.target;
    validateField(name, value);
  }

  // Validate single field using validators.js
  function validateField(name, value) {
    let error = null;

    if (name === "confirmPassword") {
      // Special handling for confirmPassword - needs password value
      if (formData.password && formData.password.trim().length > 0) {
        error = validators.confirmPassword(formData.password, value);
      } else if (value && value.trim().length > 0) {
        // If confirmPassword is provided but password is not
        error = "Моля, въведете парола";
      }
    } else {
      const validator = validators[name];
      if (validator) {
        // For optional fields (username, password), only validate if value is provided
        if ((name === "username" || name === "password") && !value) {
          error = null; // Optional fields are not required
        } else {
          error = validator(value);
        }
      }
    }

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

    // Validate username (optional, but if provided must be valid)
    if (formData.username && formData.username.trim().length > 0) {
      const usernameError = validators.username(formData.username);
      if (usernameError) {
        errors.username = usernameError;
        isValid = false;
      }
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

    // Validate password (optional when editing, but if provided must be valid and match confirmation)
    if (formData.password && formData.password.trim().length > 0) {
      const passwordError = validators.password(formData.password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }

      // If password is provided, confirmPassword is required and must match
      if (!formData.confirmPassword || formData.confirmPassword.trim().length === 0) {
        errors.confirmPassword = "Моля, потвърдете паролата";
        isValid = false;
      } else {
        const confirmPasswordError = validators.confirmPassword(formData.password, formData.confirmPassword);
        if (confirmPasswordError) {
          errors.confirmPassword = confirmPasswordError;
          isValid = false;
        }
      }
    } else if (formData.confirmPassword && formData.confirmPassword.trim().length > 0) {
      // If confirmPassword is provided but password is not, show error
      errors.confirmPassword = "Моля, въведете парола";
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

    try {
      // Check if email is already taken by another user
      const usersResponse = await fetch(USERS_API_URL);
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

      // Only include password if it's provided AND matches confirmation (optional when editing)
      if (formData.password && formData.password.trim().length > 0) {
        // Double-check that passwords match before updating
        if (formData.password !== formData.confirmPassword) {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: "Паролите не съвпадат",
          }));
          showToast("error", "Паролите не съвпадат. Моля, проверете отново.");
          setIsSubmitting(false);
          return;
        }
        // Only update password if they match
        updateData.password = formData.password;
      }

      // Update user using useUser hook
      const updatedUser = await updateUser(userId, updateData);

      // Automatically update AuthContext.user and persist in localStorage
      updateUserInAuth(updatedUser);

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

  // Show loading while auth is initializing
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане..." />
      </div>
    );
  }

  // Show loading while profile is loading (but auth is ready)
  if (isLoadingUser) {
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

  // If no profile user and not loading, show loading (might still be loading)
  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Зареждане на профил..." />
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
              placeholder="Минимум 3 символа (опционално)"
              optional={true}
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

          {/* Password Field */}
          <div className="mb-6">
            <FormField
              label="Нова парола"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.password}
              placeholder="Оставете празно, за да запазите текущата парола"
              optional={true}
              disabled={isSubmitting}
            />
          </div>

          {/* Confirm Password Field - Always visible when password is entered */}
          {formData.password && formData.password.trim().length > 0 && (
            <div className="mb-6">
              <FormField
                label="Повтори новата парола"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={formErrors.confirmPassword}
                placeholder="Въведете паролата отново"
                disabled={isSubmitting}
              />
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
              disabled={isSubmitting || Object.keys(formErrors).some(key => formErrors[key])}
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
