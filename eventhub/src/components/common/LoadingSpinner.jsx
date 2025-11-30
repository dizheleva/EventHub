export function LoadingSpinner({ message = "Зареждане..." }) {
  return (
    <div className="text-center py-20">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

