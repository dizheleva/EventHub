import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, children }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Търси събитие..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:shadow-md"
        />
      </div>
      {children}
    </div>
  );
}

