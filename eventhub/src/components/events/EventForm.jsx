import { useState } from "react";
import { validators } from "@/utils/validators";
import { Toast } from "@/components/common/Toast";
import { FormField } from "@/components/common/FormField";

// Initial form state
const INITIAL_FORM_STATE = {
  title: "",
  date: "",
  location: "",
  description: "",
  imageUrl: "",
};

export function EventForm({ onEventCreated }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Validate single field
  function validateField(name, value) {
    const validator = validators[name];
    if (!validator) return null;
    return validator(value);
  }

  // Validate all fields
  function validateForm(data) {
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    return newErrors;
  }

  // Check if form has errors
  const hasErrors = Object.keys(errors).length > 0;

  // Handle input change with validation
  function handleChange(e) {
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
  function handleBlur(e) {
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
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Грешка при създаване на събитие");
      }

      const newEvent = await res.json();
      
      // Show success toast
      setToast({
        type: "success",
        message: "Събитието беше създадено успешно!",
      });

      // Clear form
      setFormData(INITIAL_FORM_STATE);
      setErrors({});

      // Callback to parent
      if (onEventCreated) {
        onEventCreated(newEvent);
      }

      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при създаване на събитие",
      });
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="bg-white shadow-soft rounded-2xl mb-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-900">Добави събитие</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Title Field */}
          <FormField
            label="Заглавие"
            name="title"
            type="text"
            placeholder="Въведете заглавие на събитието"
            value={formData.title}
            error={errors.title}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />

          {/* Date Field */}
          <FormField
            label="Дата"
            name="date"
            type="date"
            value={formData.date}
            error={errors.date}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            min={new Date().toISOString().split("T")[0]}
          />

          {/* Location Field */}
          <FormField
            label="Локация"
            name="location"
            type="text"
            placeholder="Въведете локация на събитието"
            value={formData.location}
            error={errors.location}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />

          {/* Description Field */}
          <FormField
            label="Описание"
            name="description"
            type="textarea"
            placeholder="Въведете описание на събитието (минимум 10 символа)"
            rows={4}
            value={formData.description}
            error={errors.description}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />

          {/* Image URL Field */}
          <FormField
            label="Снимка (URL)"
            name="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            error={errors.imageUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            optional={true}
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
              {isSubmitting ? "Запазване..." : "Създай събитие"}
            </button>
        </form>
      </div>
    </>
  );
}
