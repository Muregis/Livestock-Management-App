import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[LiveStock Error] ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page or contact support.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-50 p-3 rounded text-sm">
                <summary className="cursor-pointer font-medium mb-2">Error details</summary>
                <pre className="whitespace-pre-wrap text-xs">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}