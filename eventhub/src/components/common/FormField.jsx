import { AlertCircle } from "lucide-react";

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
  onBlur,
  optional = false,
  rows = 1,
  disabled = false,
  min,
  ...otherProps
}) {
  const isTextarea = type === "textarea";
  const inputId = name;
  const errorId = `${name}-error`;

  const baseInputClasses = `w-full border rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-primary focus:ring-primary"
  }`;

  const textareaClasses = `${baseInputClasses} resize-none`;
  const inputClasses = baseInputClasses;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1 min-h-[1.5rem]">
        {label}{" "}
        {!optional && <span className="text-red-500">*</span>}
        {optional && <span className="text-gray-400 text-xs">(незадължително)</span>}
        {!optional && <span className="invisible text-xs">(незадължително)</span>}
      </label>

      {isTextarea ? (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          rows={rows}
          className={textareaClasses}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          {...otherProps}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          className={inputClasses}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          min={min}
          {...otherProps}
        />
      )}

      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

