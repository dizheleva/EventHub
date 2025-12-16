import { Link } from "react-router";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-pink-50/30">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                {/* 404 Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-primary" />
                    </div>
                </div>

                {/* 404 Title */}
                <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">
                    404
                </h1>

                {/* Error Message */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Страницата не е намерена
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                    Съжаляваме, но страницата, която търсите, не съществува.
                </p>
                <p className="text-base text-gray-500 mb-8">
                    Може би е премахната, преименувана или адресът е неправилен.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Начална страница
                    </Link>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Назад
                    </button>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-sm text-gray-500">
                    Ако смятате, че това е грешка, моля свържете се с поддръжката.
                </p>
            </div>
        </div>
    );
}

