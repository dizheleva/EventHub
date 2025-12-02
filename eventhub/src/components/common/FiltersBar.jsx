import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

export function FiltersBar({
  cities,
  categories,
  selectedCity,
  selectedCategory,
  selectedPrice,
  onCityChange,
  onCategoryChange,
  onPriceChange,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const filtersRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openDropdown]);

  function toggleDropdown(type) {
    setOpenDropdown(openDropdown === type ? null : type);
  }

  function handleCitySelect(city) {
    onCityChange(city);
    setOpenDropdown(null);
  }

  function handleCategorySelect(category) {
    onCategoryChange(category);
    setOpenDropdown(null);
  }

  function handlePriceSelect(price) {
    onPriceChange(price);
    setOpenDropdown(null);
  }

  function clearCity() {
    onCityChange("");
    setOpenDropdown(null);
  }

  function clearCategory() {
    onCategoryChange("");
    setOpenDropdown(null);
  }

  function clearPrice() {
    onPriceChange("");
    setOpenDropdown(null);
  }

  const cityLabel = selectedCity || "Град";
  const categoryLabel = selectedCategory 
    ? categories.find(c => c.value === selectedCategory)?.label || "Категория"
    : "Категория";
  const priceLabel = selectedPrice === "free" ? "Безплатно" : "Цена";

  return (
    <div ref={filtersRef} className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Филтрирай по:</span>
      
      {/* City Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("city")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCity
              ? "bg-blue-50 text-blue-700 border border-blue-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
          }`}
        >
          {cityLabel}
          {selectedCity && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearCity();
              }}
              className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
              aria-label="Премахни филтър град"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "city" ? "rotate-180" : ""}`} />
        </button>
        {openDropdown === "city" && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
            <button
              onClick={() => handleCitySelect("")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
            >
              Всички градове
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedCity === city ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("category")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory
              ? "bg-yellow-50 text-yellow-700 border border-yellow-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
          }`}
        >
          {categoryLabel}
          {selectedCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearCategory();
              }}
              className="ml-1 hover:bg-yellow-100 rounded-full p-0.5"
              aria-label="Премахни филтър категория"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`} />
        </button>
        {openDropdown === "category" && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
            <button
              onClick={() => handleCategorySelect("")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
            >
              Всички категории
            </button>
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategorySelect(category.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedCategory === category.value ? "bg-yellow-50 text-yellow-700" : ""
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("price")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPrice
              ? "bg-green-50 text-green-700 border border-green-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
          }`}
        >
          {priceLabel}
          {selectedPrice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearPrice();
              }}
              className="ml-1 hover:bg-green-100 rounded-full p-0.5"
              aria-label="Премахни филтър цена"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "price" ? "rotate-180" : ""}`} />
        </button>
        {openDropdown === "price" && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[150px]">
            <button
              onClick={() => handlePriceSelect("")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
            >
              Всички
            </button>
            <button
              onClick={() => handlePriceSelect("free")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                selectedPrice === "free" ? "bg-green-50 text-green-700" : ""
              }`}
            >
              Безплатно
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

