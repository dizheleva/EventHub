import { AlertCircle } from "lucide-react";
import { CATEGORIES } from "@/utils/categories";

export default function CategorySelect({ value, onChange, onBlur, error, disabled, id = "category" }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        Категория <span className="text-red-500">*</span>
      </label>
      <select
        id={id}
        name="category"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full border rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-primary focus:ring-primary"
        }`}
      >
        <option value="">Изберете категория</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1" role="alert">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}




