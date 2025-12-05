import { useState } from "react";
import { validators } from "@/utils/validators";
import { Toast } from "@/components/common/Toast";
import { FormField } from "@/components/common/FormField";
import { CategorySelect } from "@/components/common/CategorySelect";
import { useAuth } from "@/contexts/AuthContext";

// Initial form state
const INITIAL_FORM_STATE = {
  title: "",
  date: "",
  location: "",
  description: "",
  imageUrl: "",
  city: "",
  category: "",
  organizer: "",
  organizerUrl: "",
  price: "",
};

export function EventForm({ mode = "create", onEventCreated, onClose }) {
  const { user } = useAuth();
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

  // Validate all fields - only validate fields that exist in the form
  function validateForm(data) {
    const newErrors = {};
    // Only validate fields that are in the form data
    Object.keys(data).forEach((field) => {
      if (validators[field]) {
        const error = validateField(field, data[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });
    return newErrors;
  }

  // Check if form has errors
  const hasErrors = Object.keys(errors).length > 0;

  // Handle input change with validation
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
      // Check if user is authenticated (required for creating events)
      if (!user || !user.id) {
        setToast({
          type: "error",
          message: "Моля, влезте в профила си, за да създадете събитие.",
        });
        setTimeout(() => {
          setToast(null);
        }, 3000);
        setIsSubmitting(false);
        return;
      }

      // Add creatorId to event data - automatically include current user's ID
      // creatorId is not visible in the form UI, it's added automatically
      // This ensures every event has a creatorId field for ownership checks
      const eventDataWithUser = {
        ...formData,
        creatorId: user.id, // Automatically set creatorId from authenticated user
      };

      // If mode is create and onEventCreated callback exists, pass data to parent
      // Parent (EventList) will handle the API call via useEvents hook
      if (mode === "create" && onEventCreated) {
        // Pass data to parent (EventList will handle API call via createEvent)
        // Await the callback to handle errors properly
        try {
          await onEventCreated(eventDataWithUser);
          
          // Only clear form and reset state if successful
          setFormData(INITIAL_FORM_STATE);
          setErrors({});
          setIsSubmitting(false);
        } catch (err) {
          // If parent callback throws error, show it and keep form data
          setToast({
            type: "error",
            message: err.message || "Възникна грешка при създаване на събитие",
          });
          setTimeout(() => {
            setToast(null);
          }, 3000);
          setIsSubmitting(false);
        }
        return;
      }

      // Fallback: If no callback, make API call directly (shouldn't happen in normal flow)
      const res = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventDataWithUser),
      });

      if (!res.ok) {
        throw new Error("Грешка при създаване на събитие");
      }

      const newEvent = await res.json();
      
      // Show success toast
      setToast({
        type: "success",
        message: "Събитието е създадено успешно!",
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

  // If used in modal, don't render the wrapper div
  const isInModal = mode === "create" && onClose;

  const formFields = (
    <>
      {/* Title Field */}
      <FormField
        label="Заглавие"
        name="title"
        type="text"
        placeholder="Въведете заглавие на събитието"
        value={formData.title}
        error={errors.title}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
      />

      {/* Date Field */}
      <FormField
        label="Дата"
        name="date"
        type="date"
        value={formData.date}
        error={errors.date}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        min={new Date().toISOString().split("T")[0]}
      />

      {/* City Field */}
      <FormField
        label="Град"
        name="city"
        type="text"
        placeholder="Въведете град"
        value={formData.city}
        error={errors.city}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
      />

      {/* Location Field */}
      <FormField
        label="Локация"
        name="location"
        type="text"
        placeholder="Въведете локация на събитието"
        value={formData.location}
        error={errors.location}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
      />

      {/* Category Field */}
      <CategorySelect
        value={formData.category}
        onChange={changeHandler}
        onBlur={blurHandler}
        error={errors.category}
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
        onChange={changeHandler}
        onBlur={blurHandler}
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
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Organizer Field */}
      <FormField
        label="Организатор"
        name="organizer"
        type="text"
        placeholder="Въведете име на организатор"
        value={formData.organizer}
        error={errors.organizer}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Organizer URL Field */}
      <FormField
        label="Уебсайт на организатор (URL)"
        name="organizerUrl"
        type="url"
        placeholder="https://example.com"
        value={formData.organizerUrl}
        error={errors.organizerUrl}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Price Field */}
      <FormField
        label="Цена"
        name="price"
        type="text"
        placeholder="Напр. Безплатно, 10 лв, 25 BGN"
        value={formData.price}
        error={errors.price}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Submit Button */}
      <div className="flex gap-3 pt-2">
        {isInModal && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Отказ
          </button>
        )}
        <button
          type="submit"
          disabled={hasErrors || isSubmitting}
          className={`${isInModal ? "flex-1" : "w-full"} py-3 px-6 rounded-xl font-medium transition-all ${
            hasErrors || isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-color hover:scale-[1.02]"
          }`}
        >
          {isSubmitting 
            ? "Запазване..." 
            : mode === "create" 
              ? "Създай събитие" 
              : "Запази промените"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {isInModal ? (
        <form onSubmit={submitHandler} className="space-y-4">
          {formFields}
        </form>
      ) : (
        <div className="bg-white shadow-soft rounded-2xl mb-10 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6">
            <h2 className="text-2xl font-bold text-gray-900">Добави събитие</h2>
          </div>
          <form onSubmit={submitHandler} className="px-6 pb-6 space-y-4">
            {formFields}
          </form>
        </div>
      )}
    </>
  );
}
