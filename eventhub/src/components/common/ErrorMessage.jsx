export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center py-20">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
        <p className="text-red-600 font-medium mb-2">Грешка при зареждане</p>
        <p className="text-red-500 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Опитай отново
          </button>
        )}
      </div>
    </div>
  );
}

