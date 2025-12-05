import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FormField } from "@/components/common/FormField";
import { Toast } from "@/components/common/Toast";

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

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  // Get redirect URL from query parameter (preserved by ProtectedRoute)
  const redirectPath = searchParams.get("redirect") || "/events";
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Validate single field
  function validateField(name, value) {
    if (name === "email") return validateEmail(value);
    if (name === "password") return validatePassword(value);
    return null;
  }

  // Validate all fields
  function validateForm(data) {
    const newErrors = {};
    const emailError = validateEmail(data.email);
    const passwordError = validatePassword(data.password);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
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
      await login(formData.email, formData.password);
      
      // Show success toast
      setToast({
        type: "success",
        message: "Успешно влизане!",
      });

      // Redirect to original destination (or /events if no redirect param)
      // This preserves the user's intended destination after login
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Възникна грешка при влизане",
      });
      setTimeout(() => {
        setToast(null);
      }, 3000);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Влизане</h1>
            <p className="text-gray-600">Влезте в своя акаунт</p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-6">
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
              placeholder="Въведете парола"
              value={formData.password}
              error={errors.password}
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
              {isSubmitting ? "Влизане..." : "Влез"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нямате акаунт?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Регистрирайте се
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

