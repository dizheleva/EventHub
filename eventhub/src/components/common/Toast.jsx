import { CheckCircle2, AlertCircle } from "lucide-react";

export function Toast({ type, message }) {
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5 ${
        type === "success"
          ? "bg-success text-white"
          : "bg-red-500 text-white"
      }`}
      role="alert"
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span>{message}</span>
    </div>
  );
}

