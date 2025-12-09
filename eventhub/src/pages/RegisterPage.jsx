import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { useForm } from "@/hooks/useForm";
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

function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return "Потребителското име е задължително";
  }
  if (username.trim().length < 3) {
    return "Потребителското име трябва да е поне 3 символа";
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
  const { showToast } = useToast();
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  function validateField(name, value, allValues) {
    if (name === "username") return validateUsername(value);
    if (name === "email") return validateEmail(value);
    if (name === "password") return validatePassword(value);
    if (name === "confirmPassword") {
      return validateConfirmPassword(allValues.password, value);
    }
    return null;
  }

  // Validate all fields
  function validateForm(data) {
    const newErrors = {};
    
    const usernameError = validateUsername(data.username);
    const emailError = validateEmail(data.email);
    const passwordError = validatePassword(data.password);
    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
    
    if (usernameError) newErrors.username = usernameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    return newErrors;
  }

  // Handle blur - validate field
  function blurHandler(e) {
    const { name, value } = e.target;
    const error = validateField(name, value, values);
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
  async function submitHandler(values) {
    // Validate all fields
    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data (without confirmPassword)
      const userData = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      };

      await register(userData);
      showToast("success", "Успешна регистрация!");
      setTimeout(() => {
        navigate("/events");
      }, 500);
    } catch (error) {
      showToast("error", error.message || "Възникна грешка при регистрация");
    } finally {
      setIsSubmitting(false);
    }
  }

  const { register: registerField, formAction, values } = useForm(submitHandler, {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validate on change (after first blur)
  function changeHandler(e) {
    registerField(e.target.name).onChange(e);
    if (errors[e.target.name]) {
      const error = validateField(e.target.name, e.target.value, values);
      setErrors((prev) => {
        if (error) {
          return { ...prev, [e.target.name]: error };
        }
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }

    // If password changes, re-validate confirmPassword
    if (e.target.name === "password" && values.confirmPassword) {
      const confirmError = validateConfirmPassword(e.target.value, values.confirmPassword);
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

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
            <p className="text-gray-600">Създайте нов акаунт</p>
          </div>

          {/* Form */}
          <form onSubmit={formAction} className="space-y-6">
            {/* Username Field */}
            <FormField
              label="Потребителско име"
              type="text"
              placeholder="Минимум 3 символа"
              {...registerField("username")}
              value={values.username}
              error={errors.username}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Email Field */}
            <FormField
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              {...registerField("email")}
              value={values.email}
              error={errors.email}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Password Field */}
            <FormField
              label="Парола"
              type="password"
              placeholder="Минимум 6 символа"
              {...registerField("password")}
              value={values.password}
              error={errors.password}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />

            {/* Confirm Password Field */}
            <FormField
              label="Потвърди парола"
              type="password"
              placeholder="Въведете паролата отново"
              {...registerField("confirmPassword")}
              value={values.confirmPassword}
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

