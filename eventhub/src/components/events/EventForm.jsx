import { useState, useEffect } from "react";
import { validators } from "@/utils/validators";
import { FormField } from "@/components/common/FormField";
import { CategorySelect } from "@/components/common/CategorySelect";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { calculateDurationMinutes } from "@/utils/eventHelpers";
import { useToast } from "@/contexts/ToastContext";

const EVENTS_API_URL = `${API_BASE_URL}/events`;

// Initial form state
const INITIAL_FORM_STATE = {
  // Core fields
  title: "",
  description: "",
  category: "",
  
  // Schedule
  startDate: "",
  endDate: "",
  durationMinutes: null,
  
  // Location
  isOnline: false,
  address: "",
  city: "",
  
  // Media
  imageUrl: "",
  websiteUrl: "",
  
  // Tickets
  price: 0,
  
  // Tags
  tags: "",
};

export function EventForm({ mode = "create", onEventCreated, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const duration = calculateDurationMinutes(formData.startDate, formData.endDate);
      setFormData(prev => ({ ...prev, durationMinutes: duration }));
    } else {
      // If endDate is removed, clear duration
      setFormData(prev => ({ ...prev, durationMinutes: null }));
    }
  }, [formData.startDate, formData.endDate]);

  // Validate single field
  function validateField(name, value) {
    const validator = validators[name];
    if (!validator) return null;
    return validator(value);
  }

  // Validate all fields
  function validateForm(data) {
    const newErrors = {};
    
    Object.keys(data).forEach((field) => {
      if (validators[field]) {
        let error = null;
        
        // Handle validators that need additional context
        if (field === "endDate") {
          error = validators.endDate(data[field], data.startDate);
        } else if (field === "address") {
          error = validators.address(data[field], data.isOnline);
        } else if (field === "city") {
          error = validators.city(data[field], data.isOnline);
        } else if (field === "price") {
          error = validators.price(data[field]);
        } else {
          error = validateField(field, data[field]);
        }
        
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
    const { name, value, type, checked } = e.target;
    
    let newValue = value;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? null : Number(value);
    } else if (type === "datetime-local") {
      newValue = value;
    }
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };
      
      // If isOnline changes, clear location fields if going online
      if (name === "isOnline" && newValue === true) {
        updated.address = "";
        updated.city = "";
      }
      
      return updated;
    });

    // Validate on change (after first blur)
    if (errors[name]) {
      let error = null;
      const currentData = { ...formData, [name]: newValue };
      
      if (name === "endDate") {
        error = validators.endDate(newValue, currentData.startDate);
      } else if (name === "address") {
        error = validators.address(newValue, currentData.isOnline);
      } else if (name === "city") {
        error = validators.city(newValue, currentData.isOnline);
      } else if (name === "price") {
        error = validators.price(newValue);
      } else {
        error = validateField(name, newValue);
      }
      
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
    let error = null;
    const currentData = { ...formData, [name]: value };
    
    if (name === "endDate") {
      error = validators.endDate(value, currentData.startDate);
    } else if (name === "address") {
      error = validators.address(value, currentData.isOnline);
    } else if (name === "city") {
      error = validators.city(value, currentData.isOnline);
    } else if (name === "price") {
      error = validators.price(value);
    } else {
      error = validateField(name, value);
    }
    
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
      // Check if user is authenticated
      if (!user || !user.id) {
        showToast("error", "Моля, влезте в профила си, за да създадете събитие.");
        setIsSubmitting(false);
        return;
      }

      // Parse tags (comma-separated)
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      // Prepare location object (country is always Bulgaria)
      const location = {
        address: formData.isOnline ? null : (formData.address || null),
        city: formData.isOnline ? null : (formData.city || null),
        country: "България",
        coordinates: null
      };

      // Prepare event data with new model
      const eventData = {
        // Core fields
        title: formData.title,
        description: formData.description,
        category: formData.category,
        
        // Location
        location: location,
        
        // Schedule
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationMinutes: formData.durationMinutes,
        
        // Media
        imageUrl: formData.imageUrl || null,
        websiteUrl: formData.websiteUrl || null,
        
        // Tickets
        price: formData.price || 0,
        
        // Type
        isOnline: formData.isOnline,
        
        // Tags
        tags: tags,
        
        // Metadata
        createdAt: new Date().toISOString(),
        creatorId: user.id,
      };

      // If mode is create and onEventCreated callback exists, pass data to parent
      if (mode === "create" && onEventCreated) {
        try {
          await onEventCreated(eventData);
          setFormData(INITIAL_FORM_STATE);
          setErrors({});
          setIsSubmitting(false);
        } catch (err) {
          showToast("error", err.message || "Възникна грешка при създаване на събитие");
          setIsSubmitting(false);
        }
        return;
      }

      // Fallback: If no callback, make API call directly
      const res = await fetch(EVENTS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        throw new Error("Грешка при създаване на събитие");
      }

      const newEvent = await res.json();
      
      // Clear form
      setFormData(INITIAL_FORM_STATE);
      setErrors({});

      // Callback to parent
      if (onEventCreated) {
        onEventCreated(newEvent);
      }

      // Show success toast
      showToast("success", "Събитието е създадено успешно!");
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при създаване на събитие");
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
        placeholder="Въведете описание на събитието (по избор)"
        rows={4}
        value={formData.description}
        error={errors.description}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Schedule Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">График</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <FormField
            label="Начална дата и час"
            name="startDate"
            type="datetime-local"
            value={formData.startDate}
            error={errors.startDate}
            onChange={changeHandler}
            onBlur={blurHandler}
            disabled={isSubmitting}
            min={new Date().toISOString().slice(0, 16)}
          />
          
          {/* End Date */}
          <FormField
            label="Крайна дата и час"
            name="endDate"
            type="datetime-local"
            value={formData.endDate}
            error={errors.endDate}
            onChange={changeHandler}
            onBlur={blurHandler}
            disabled={isSubmitting}
            min={formData.startDate || new Date().toISOString().slice(0, 16)}
            optional={true}
          />
        </div>
        
        {/* Duration (read-only, auto-calculated) */}
        <div className="text-sm text-gray-600">
          Продължителност: {formData.durationMinutes 
            ? `${Math.floor(formData.durationMinutes / 60)}ч ${formData.durationMinutes % 60}м`
            : "неизвестно"}
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Локация</h3>
        
        {/* Online Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isOnline"
              checked={formData.isOnline}
              onChange={changeHandler}
              disabled={isSubmitting}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Онлайн събитие</span>
          </label>
        </div>
        
        {/* Physical Location Fields */}
        {!formData.isOnline && (
          <>
            <FormField
              label="Адрес"
              name="address"
              type="text"
              placeholder="Въведете пълен адрес"
              value={formData.address}
              error={errors.address}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />
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
          </>
        )}
        
        {formData.isOnline && (
          <p className="text-sm text-gray-600">Събитието ще се проведе онлайн.</p>
        )}
      </div>

      {/* Price Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Цена</h3>
        
        <FormField
          label="Цена (0 = безплатно)"
          name="price"
          type="number"
          placeholder="0"
          value={formData.price || ""}
          error={errors.price}
          onChange={changeHandler}
          onBlur={blurHandler}
          disabled={isSubmitting}
          min="0"
          step="0.01"
        />
      </div>

      {/* Tags Section */}
      <FormField
        label="Тагове"
        name="tags"
        type="text"
        placeholder="Разделете таговете със запетая (напр. музика, концерт, рок)"
        value={formData.tags}
        error={errors.tags}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
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

      {/* Website URL Field */}
      <FormField
        label="Официална страница / Повече информация (URL)"
        name="websiteUrl"
        type="url"
        placeholder="https://example.com/event"
        value={formData.websiteUrl}
        error={errors.websiteUrl}
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
