import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        // Обновява state, за да покаже резервен UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Логва грешката за debugging
        console.error('Error Boundary caught an error:', error, errorInfo);
        this.setState({
            errorInfo: errorInfo
        });
    }

    handleReset = () => {
        // Ресетва state, за да опита отново
        this.setState({ 
            hasError: false, 
            error: null,
            errorInfo: null 
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-pink-50/30">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                        {/* Error Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Опа! Нещо се обърка
                        </h1>

                        {/* Error Message */}
                        <p className="text-lg text-gray-600 mb-2">
                            Съжаляваме, но възникна неочаквана грешка.
                        </p>
                        <p className="text-base text-gray-500 mb-8">
                            Можем да опитаме да оправим проблема или да се върнем в началото.
                        </p>

                        {/* Error Details (only in development) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-8 text-left bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                                    Детайли за грешката (само в development)
                                </summary>
                                <div className="mt-2 text-xs text-gray-600 font-mono overflow-auto max-h-48">
                                    <p className="mb-2">
                                        <strong>Грешка:</strong> {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre className="whitespace-pre-wrap break-words">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-color transition-all"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Опитай отново
                            </button>
                            
                            <Link
                                to="/"
                                onClick={this.handleReset}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                            >
                                <Home className="w-5 h-5" />
                                Начална страница
                            </Link>
                        </div>

                        {/* Help Text */}
                        <p className="mt-8 text-sm text-gray-500">
                            Ако проблемът продължава, моля свържете се с поддръжката.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

