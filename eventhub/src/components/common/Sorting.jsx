import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export function Sorting({ sortBy, sortOrder, onSortChange }) {
  const sortFields = [
    { key: "title", label: "Заглавие", color: "yellow" },
    { key: "date", label: "Дата", color: "blue" },
    { key: "location", label: "Локация", color: "green" },
  ];

  // Color styles configuration
  const colorStyles = {
    yellow: {
      active: "bg-yellow-50 text-yellow-700 border border-yellow-300",
      icon: "text-yellow-500",
    },
    blue: {
      active: "bg-blue-50 text-blue-700 border border-blue-300",
      icon: "text-blue-500",
    },
    green: {
      active: "bg-green-50 text-green-700 border border-green-300",
      icon: "text-green-500",
    },
  };

  function sortHandler(field) {
    if (sortBy === field) {
      // Toggle between ascending and descending
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, start with ascending
      onSortChange(field, "asc");
    }
  }

  function getSortIcon(fieldKey, fieldColor) {
    if (sortBy !== fieldKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    const iconColor = colorStyles[fieldColor].icon;
    return sortOrder === "asc" ? (
      <ArrowUp className={`w-4 h-4 ${iconColor}`} />
    ) : (
      <ArrowDown className={`w-4 h-4 ${iconColor}`} />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Сортирай по:</span>
      {sortFields.map((field) => {
        const isActive = sortBy === field.key;
        const buttonClasses = isActive
          ? colorStyles[field.color].active
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";

        return (
          <button
            key={field.key}
            onClick={() => sortHandler(field.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${buttonClasses}`}
          >
            {field.label}
            {getSortIcon(field.key, field.color)}
          </button>
        );
      })}
    </div>
  );
}

