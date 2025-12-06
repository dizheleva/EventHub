import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary - Global error boundary component
 * 
 * Catches runtime rendering errors and component crashes
 * throughout the application and displays a friendly fallback UI.
 * 
 * This is a class component because Error Boundaries must be class components
 * in React (they use componentDidCatch and getDerivedStateFromError).
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * getDerivedStateFromError - Static method that updates state
   * so the next render will show the fallback UI
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state to update the component
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error,
    };
  }

  /**
   * componentDidCatch - Lifecycle method that catches errors
   * in any child component tree
   * 
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Component stack trace
   */
  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Update state with error info (useful for logging to error reporting service)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  /**
   * handleReload - Reloads the page to reset the application state
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    // If there's an error, render the fallback UI
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Възникна грешка
            </h1>
            <p className="text-gray-600 mb-8">
              Съжаляваме, но възникна неочаквана грешка. Моля, опитайте отново.
            </p>

            {/* Reload Button */}
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Презареди страницата</span>
            </button>

            {/* Development Error Details (only in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
                  Детайли за грешката (само в development)
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg overflow-auto max-h-48">
                  <pre className="text-xs text-red-600 whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

