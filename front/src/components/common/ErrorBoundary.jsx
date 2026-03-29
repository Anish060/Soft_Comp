import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-red-900 font-bold text-lg mb-1">Something went wrong</h3>
            <p className="text-red-600 text-sm max-w-xs mx-auto">
              {this.state.error?.message || "An unexpected error occurred in this component."}
            </p>
          </div>
          
          <button 
            onClick={this.handleReset}
            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={14} />
            Try Again
          </button>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <div className="mt-4 w-full text-left">
              <details className="text-[10px] text-red-800 bg-red-100/50 p-3 rounded-lg overflow-auto max-h-40">
                <summary className="font-bold cursor-pointer mb-1">Error Details</summary>
                <pre className="whitespace-pre-wrap font-mono">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
