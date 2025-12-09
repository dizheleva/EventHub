import { cn } from "@/lib/utils";

/**
 * Toggle component for filtering events by source (All, Local, External)
 */
export function SourceFilterToggle({ value, onChange }) {
  const options = [
    { value: "all", label: "Всички" },
    { value: "local", label: "Потребителски" },
    { value: "external", label: "Външни" },
  ];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
            value === option.value
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

