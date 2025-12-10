import { Plus } from "lucide-react";

/**
 * AddEventButton - Button for creating new events
 * @param {function} onClick - Handler function when button is clicked
 * @param {string} variant - Button variant: "inline" (small, inline) or "standalone" (large, centered)
 */
export default function AddEventButton({ onClick, variant = "inline" }) {
  if (variant === "standalone") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:shadow-color transition-all mx-auto"
      >
        <Plus className="w-5 h-5" />
        Добави събитие
      </button>
    );
  }

  // Inline variant (default) - positioned next to search bar
  return (
    <div className="mb-4 flex justify-end">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 h-[42px] bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm font-medium hover:shadow-color transition-all border border-transparent whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        Добави събитие
      </button>
    </div>
  );
}

