import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { FormField } from "@/components/common/FormField";

// Validation functions
function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return "Email адресът е задължителен";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Моля, въведете валиден email адрес";
  }
  return null;
}

function validatePassword(password) {
  if (!password || password.trim().length === 0) {
    return "Паролата е задължителна";
  }
  if (password.length < 6) {
    return "Паролата трябва да е поне 6 символа";
  }
  return null;
}

function validateName(name) {
  if (!name || name.trim().length === 0) {
    return "Името е задължително";
  }
  if (name.trim().length < 2) {
    return "Името трябва да е поне 2 символа";
  }
  return null;
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return "Потвърждението на паролата е задължително";
  }
  if (password !== confirmPassword) {
    return "Паролите не съвпадат";
  }
  return null;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Validate single field
  function validateField(name, value) {
    if (name === "name") return validateName(value);
    if (name === "email") return validateEmail(value);
    if (name === "password") return validatePassword(value);
    if (name === "confirmPassword") {
      return validateConfirmPassword(formData.password, value);
    }
    return null;
  }

  // Validate all fields
  function validateForm(data) {
    const newErrors = {};
    
    const nameError = validateName(data.name);
    const emailError = validateEmail(data.email);
    const passwordError = validatePassword(data.password);
    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
    
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    return newErrors;
  }

  // Handle input change
  function changeHandler(e) {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change (after first blur)
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors((prev) => {
        if (error) {
          return { ...prev, [name]: error };
        }
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // If password changes, re-validate confirmPassword
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(value, formData.confirmPassword);
      setErrors((prev) => {
        if (confirmError) {
          return { ...prev, confirmPassword: confirmError };
        }
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }

  // Handle blur - validate field
  function blurHandler(e) {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => {
      if (error) {
        return { ...prev, [name]: error };
      }
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }

  // Handle form submit
  async function submitHandler(e) {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data (without confirmPassword)
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      await register(userData);
      
      // Show success toast
      showToast("success", "Успешна регистрация!");

      // Redirect to events page after short delay
      setTimeout(() => {
        navigate("/events");
      }, 500);
    } catch (error) {
      showToast("error", error.message || "Възникна грешка при регистрация");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Toast Notification */}
        {toast && <Toast type={toast.type} message={toast.message} />}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
            <p className="text-gray-600">Създайте нов акаунт</p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-6">
            {/* Name Field */}
            <FormField
              label="Име"
              name="name"
              type="text"
              placeholder="Вашето име"
              value={formData.name}
              error={errors.name}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Email Field */}
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              error={errors.email}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Password Field */}
            <FormField
              label="Парола"
              name="password"
              type="password"
              placeholder="Минимум 6 символа"
              value={formData.password}
              error={errors.password}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Confirm Password Field */}
            <FormField
              label="Потвърди парола"
              name="confirmPassword"
              type="password"
              placeholder="Въведете паролата отново"
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={hasErrors || isSubmitting}
              className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                hasErrors || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-color hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "Регистриране..." : "Регистрирай се"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Вече имате акаунт?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Влезте
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

