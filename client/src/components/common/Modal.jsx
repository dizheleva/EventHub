import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(() => {
                document.body.style.overflow = "";
            }, 0);
            return () => clearTimeout(timeout);
        }

        function escapeHandler(e) {
            if (e.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", escapeHandler);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", escapeHandler);
            setTimeout(() => {
                document.body.style.overflow = "";
            }, 0);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    {title && <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="ml-auto p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Затвори"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

