import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
          Покажи:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-gray-600">
          от {totalItems} събития
        </span>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Показване {startItem}-{endItem} от {totalItems}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
            aria-label="Предишна страница"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-700 px-3">
            Страница {currentPage} от {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
            aria-label="Следваща страница"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

