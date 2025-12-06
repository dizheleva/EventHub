import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { CATEGORIES } from "@/utils/categories";

export function EventsFilters({ filters, onChange, cities = [] }) {
  const { city = "", category = "", price = "" } = filters || {};
  const [openDropdown, setOpenDropdown] = useState(null);
  const filtersRef = useRef(null);

  // Map for all current filter values
  const filterValues = { city, category, price };

  // Centralized style settings for each filter
  const filterStyles = {
    city: {
      active: "bg-blue-50 text-blue-700 border border-blue-300",
      clearHover: "hover:bg-blue-100",
      optionActive: "bg-blue-50 text-blue-700",
    },
    category: {
      active: "bg-yellow-50 text-yellow-700 border border-yellow-300",
      clearHover: "hover:bg-yellow-100",
      optionActive: "bg-yellow-50 text-yellow-700",
    },
    price: {
      active: "bg-green-50 text-green-700 border border-green-300",
      clearHover: "hover:bg-green-100",
      optionActive: "bg-green-50 text-green-700",
    },
    default:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

  // Unified handlers
  function toggleDropdown(type) {
    setOpenDropdown(openDropdown === type ? null : type);
  }

  function handleSelect(type, value) {
    onChange({ ...filters, [type]: value });
    setOpenDropdown(null);
  }

  function clearFilter(type) {
    onChange({ ...filters, [type]: "" });
    setOpenDropdown(null);
  }

  // Labels
  function getFilterLabel(type, value) {
    if (type === "city") return value || "Град";
    if (type === "category") {
      if (!value) return "Категория";
      return CATEGORIES.find(c => c.value === value)?.label || "Категория";
    }
    if (type === "price") return value === "free" ? "Безплатно" : "Цена";
    return "";
  }

  // Filter configuration
  const filterConfigs = [
    {
      type: "city",
      options: [
        { value: "", label: "Всички градове" },
        ...cities.map((cityName) => ({ value: cityName, label: cityName })),
      ],
    },
    {
      type: "category",
      options: [
        { value: "", label: "Всички категории" },
        ...CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label })),
      ],
    },
    {
      type: "price",
      options: [
        { value: "", label: "Всички" },
        { value: "free", label: "Безплатно" },
      ],
    },
  ];

  // Nested reusable component
  function FilterButton({ type, value, label, isOpen, onClick, onClear }) {
    const hasValue = !!value;
    const style = hasValue ? filterStyles[type].active : filterStyles.default;
    const clearHover = hasValue ? filterStyles[type].clearHover : "";

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${style}`}
      >
        {label}
        {hasValue && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className={`ml-1 rounded-full p-0.5 ${clearHover}`}
            aria-label={`Премахни филтър ${type}`}
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    );
  }

  return (
    <div ref={filtersRef} className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Филтрирай по:</span>

      {filterConfigs.map((config) => {
        const type = config.type;
        const currentValue = filterValues[type];
        const label = getFilterLabel(type, currentValue);
        const isOpen = openDropdown === type;

        return (
          <div key={type} className="relative">
            <FilterButton
              type={type}
              value={currentValue}
              label={label}
              isOpen={isOpen}
              onClear={() => clearFilter(type)}
              onClick={() => toggleDropdown(type)}
            />

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
                {config.options.map((option, index) => {
                  const isActive = currentValue === option.value;
                  const optionColor = isActive
                    ? filterStyles[type].optionActive
                    : "";

                  return (
                    <button
                      key={`${type}-${option.value}-${index}`}
                      onClick={() => handleSelect(type, option.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        index === 0 ? "rounded-t-lg" : ""
                      } ${optionColor}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
