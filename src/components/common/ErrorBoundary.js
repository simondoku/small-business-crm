// src/components/common/ErrorBoundary.js
import React, { Component } from 'react';

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
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // In production, you would log to a service like Sentry, LogRocket, etc.
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-dark-500 px-4">
          <div className="bg-dark-400 border border-dark-300 rounded-2xl p-6 max-w-md w-full shadow-apple-lg">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-red-500 bg-opacity-10 flex items-center justify-center">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl text-center font-semibold text-white mb-3">Something went wrong</h2>
            <p className="text-gray-400 text-center mb-6">
              We're sorry for the inconvenience. The error has been logged and we're working to fix it.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
            
            {/* Show error details only in development */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 border-t border-dark-300 pt-6">
                <h3 className="text-lg font-medium text-white mb-2">Error Details:</h3>
                <div className="bg-dark-300 rounded-lg p-4 overflow-auto max-h-60">
                  <p className="text-red-400 font-mono text-sm">{this.state.error && this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="text-gray-400 font-mono text-xs mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;