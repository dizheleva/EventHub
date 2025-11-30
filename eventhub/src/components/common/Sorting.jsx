import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export function Sorting({ sortBy, sortOrder, onSortChange }) {
  const sortFields = [
    { key: "title", label: "Заглавие" },
    { key: "date", label: "Дата" },
    { key: "location", label: "Локация" },
  ];

  function handleSort(field) {
    if (sortBy === field) {
      // Toggle between ascending and descending
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, start with ascending
      onSortChange(field, "asc");
    }
  }

  function getSortIcon(field) {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    const iconColor = field === "title" 
      ? "text-yellow-500" 
      : field === "date" 
      ? "text-blue-500" 
      : "text-green-500";
    return sortOrder === "asc" ? (
      <ArrowUp className={`w-4 h-4 ${iconColor}`} />
    ) : (
      <ArrowDown className={`w-4 h-4 ${iconColor}`} />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Сортирай по:</span>
      {sortFields.map((field) => (
        <button
          key={field.key}
          onClick={() => handleSort(field.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sortBy === field.key
              ? field.key === "title"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-300"
                : field.key === "date"
                ? "bg-blue-50 text-blue-700 border border-blue-300"
                : "bg-green-50 text-green-700 border border-green-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
          }`}
        >
          {field.label}
          {getSortIcon(field.key)}
        </button>
      ))}
    </div>
  );
}

