import { useState, useEffect } from "react";
import { validators } from "@/utils/validators";
import FormField from "@/components/common/FormField";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CategorySelect from "@/components/common/CategorySelect";
import { normalizeEvent } from "@/utils/eventHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { API_BASE_URL } from "@/config/api";
import { useToast } from "@/hooks/useToast";

const EVENTS_API_URL = `${API_BASE_URL}/events`;

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  category: "",
  startDate: "",
  endDate: "",
  isOnline: false,
  address: "",
  city: "",
  imageUrl: "",
  websiteUrl: "",
  price: 0,
  tags: "",
};

export default function EditEventForm({ eventId, onEventUpdated, onClose }) {
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Handle form submit
  async function submitHandler(values) {
    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse tags
      const tags = values.tags
        ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      // Prepare location object (country is always Bulgaria)
      const location = {
        address: values.isOnline ? null : (values.address || null),
        city: values.isOnline ? null : (values.city || null),
        country: "България",
        coordinates: null
      };

      // Prepare event data
      const eventData = {
        title: values.title,
        description: values.description,
        category: values.category,
        location: location,
        startDate: values.startDate,
        endDate: values.endDate || null,
        imageUrl: values.imageUrl || null,
        websiteUrl: values.websiteUrl || null,
        price: values.price || 0,
        isOnline: values.isOnline,
        tags: tags,
        updatedAt: new Date().toISOString(),
        // Keep creatorId
        creatorId: user.id,
      };

      const res = await fetch(`${EVENTS_API_URL}/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        throw new Error("Грешка при обновяване на събитието");
      }

      const updatedEvent = await res.json();
      
      // Call callback first (it will show toast and close modal)
      if (onEventUpdated) {
        onEventUpdated(updatedEvent);
      } else {
        // If no callback, show toast and close manually
        showToast("success", "Събитието е обновено успешно!");
        if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      showToast("error", err.message || "Възникна грешка при обновяване на събитието");
    } finally {
      setIsSubmitting(false);
    }
  }

  const { register, formAction, values, setValues } = useForm(submitHandler, INITIAL_FORM_STATE);


  // Fetch event data when component mounts or eventId changes
  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);
    fetch(`${EVENTS_API_URL}/${eventId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch event: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(event => {
        // Don't update state if component was unmounted or eventId changed
        if (isCancelled) return;

        // Normalize event to new format
        const normalized = normalizeEvent(event);
        
        // Authorization check
        const eventCreatorId = normalized.creatorId;
        if (user && eventCreatorId !== user.id) {
          showToast("error", "Нямате права да редактирате това събитие");
          setTimeout(() => {
            if (onClose) onClose();
          }, 2000);
          setIsLoading(false);
          return;
        }

        // Format dates for datetime-local input
        const formatDateTimeLocal = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          // Format as YYYY-MM-DDTHH:mm
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setValues({
          title: normalized.title || "",
          description: normalized.description || "",
          category: normalized.category || "",
          startDate: formatDateTimeLocal(normalized.startDate),
          endDate: formatDateTimeLocal(normalized.endDate),
          isOnline: normalized.isOnline || false,
          address: normalized.location?.address || "",
          city: normalized.location?.city || "",
          imageUrl: normalized.imageUrl || "",
          websiteUrl: normalized.websiteUrl || "",
          price: normalized.price || 0,
          tags: Array.isArray(normalized.tags) ? normalized.tags.join(", ") : "",
        });
        setIsLoading(false);
      })
      .catch(err => {
        if (isCancelled) return;
        console.error("Error fetching event:", err);
        showToast("error", err.message || "Възникна грешка при зареждане на събитието");
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user?.id]); // Only depend on eventId and user.id, not functions

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

  // Handle input change
  function changeHandler(e) {
    const { name, value, type, checked } = e.target;
    
    let newValue = value;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? null : Number(value);
    }
    
    // Use useForm's changeHandler
    register(name).onChange(e);
    
    // If isOnline changes, clear location fields if going online
    if (name === "isOnline" && newValue === true) {
      setValues(prev => ({
        ...prev,
        [name]: newValue,
        address: "",
        city: "",
      }));
    }

    // Validate on change
    if (errors[name]) {
      let error = null;
      const currentData = { ...values, [name]: newValue };
      
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

  // Handle blur
  function blurHandler(e) {
    const { name, value } = e.target;
    let error = null;
    const currentData = { ...values, [name]: value };
    
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

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner message="Зареждане на данни..." />
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={formAction} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
      {/* Title */}
      <FormField
        label="Заглавие"
        type="text"
        placeholder="Въведете заглавие на събитието"
        {...register("title")}
        value={values.title}
        error={errors.title}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
      />

      {/* Category */}
      <CategorySelect
        value={values.category}
        onChange={changeHandler}
        onBlur={blurHandler}
        error={errors.category}
        disabled={isSubmitting}
      />

      {/* Description */}
      <FormField
        label="Описание"
        type="textarea"
        placeholder="Въведете описание на събитието (по избор)"
        rows={4}
        {...register("description")}
        value={values.description}
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
          <FormField
            label="Начална дата и час"
            type="datetime-local"
            {...register("startDate")}
            value={values.startDate}
            error={errors.startDate}
            onChange={changeHandler}
            onBlur={blurHandler}
            disabled={isSubmitting}
          />
          
          <FormField
            label="Крайна дата и час"
            type="datetime-local"
            {...register("endDate")}
            value={values.endDate}
            error={errors.endDate}
            onChange={changeHandler}
            onBlur={blurHandler}
            disabled={isSubmitting}
            min={values.startDate}
            optional={true}
          />
        </div>
        
      </div>

      {/* Location Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Локация</h3>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isOnline")}
              checked={values.isOnline}
              onChange={changeHandler}
              disabled={isSubmitting}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Онлайн събитие</span>
          </label>
        </div>
        
        {!values.isOnline && (
          <>
            <FormField
              label="Адрес"
              type="text"
              placeholder="Въведете пълен адрес"
              {...register("address")}
              value={values.address}
              error={errors.address}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />
            <FormField
              label="Град"
              type="text"
              placeholder="Въведете град"
              {...register("city")}
              value={values.city}
              error={errors.city}
              onChange={changeHandler}
              onBlur={blurHandler}
              disabled={isSubmitting}
            />
          </>
        )}
      </div>

      {/* Tickets */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Билети</h3>
        
        <FormField
          label="Цена (0 = безплатно)"
          type="number"
          placeholder="0"
          {...register("price")}
          value={values.price || ""}
          error={errors.price}
          onChange={changeHandler}
          onBlur={blurHandler}
          disabled={isSubmitting}
          min="0"
          step="0.01"
        />
      </div>

      {/* Tags */}
      <FormField
        label="Тагове"
        type="text"
        placeholder="Разделете таговете със запетая"
        {...register("tags")}
        value={values.tags}
        error={errors.tags}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Image URL */}
      <FormField
        label="Снимка (URL)"
        type="url"
        placeholder="https://example.com/image.jpg"
        {...register("imageUrl")}
        value={values.imageUrl}
        error={errors.imageUrl}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Website URL */}
      <FormField
        label="Официална страница / Повече информация (URL)"
        type="url"
        placeholder="https://example.com/event"
        {...register("websiteUrl")}
        value={values.websiteUrl}
        error={errors.websiteUrl}
        onChange={changeHandler}
        onBlur={blurHandler}
        disabled={isSubmitting}
        optional={true}
      />

      {/* Submit Buttons */}
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
  );
}
