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
    return sortOrder === "asc" ? (
      <ArrowUp className="w-4 h-4 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary" />
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
              ? "bg-primary/10 text-primary border border-primary/20"
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

