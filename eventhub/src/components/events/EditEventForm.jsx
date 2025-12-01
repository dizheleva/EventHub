import { useState, useEffect } from "react";
import { validators } from "@/utils/validators";
import { Toast } from "@/components/common/Toast";
import { FormField } from "@/components/common/FormField";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Helper function to format date for input[type="date"]
function formatDateForInput(dateString) {
  if (!dateString) return "";
  // If date is already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // Try to parse and format the date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function EditEventForm({ eventId, onEventUpdated, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Fetch event data when component mounts or eventId changes
  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`http://localhost:5000/events/${eventId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch event: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(event => {
        setFormData({
          title: event.title || "",
          date: formatDateForInput(event.date),
          location: event.location || "",
          description: event.description || "",
          imageUrl: event.imageUrl || "",
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching event:", err);
        setToast({
          type: "error",
          message: err.message || "Възникна грешка при зареждане на събитието",
        });
        setTimeout(() => setToast(null), 3000);
        setIsLoading(false);
      });
  }, [eventId]);

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

    if (!eventId) {
      setToast({
        type: "error",
        message: "Грешка: Липсва ID на събитието",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Validate all fields
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for PUT request
      const updateData = {
        id: eventId,
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = "Грешка при обновяване на събитие";
        try {
          const errorText = await res.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
        }
        errorMessage = `Грешка ${res.status}: ${errorMessage}`;
        throw new Error(errorMessage);
      }

      // Handle response
      let updatedEvent;
      const responseText = await res.text();
      if (responseText) {
        try {
          updatedEvent = JSON.parse(responseText);
        } catch {
          updatedEvent = { id: eventId, ...updateData };
        }
      } else {
        updatedEvent = { id: eventId, ...updateData };
      }
      
      // Show success toast
      setToast({
        type: "success",
        message: "Събитието беше обновено успешно!",
      });

      // Clear errors
      setErrors({});

      // Callback to parent
      if (onEventUpdated) {
        onEventUpdated(updatedEvent);
      }

      // Close modal after successful update
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Възникна грешка при обновяване на събитие",
      });
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading spinner while fetching event data
  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner message="Зареждане на данни..." />
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      <form onSubmit={submitHandler} className="space-y-4">
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

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={hasErrors || isSubmitting}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
              hasErrors || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-color hover:scale-[1.02]"
            }`}
          >
            {isSubmitting ? "Запазване..." : "Запази промените"}
          </button>
        </div>
      </form>
    </>
  );
}

