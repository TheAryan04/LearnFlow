import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LearnFlow ErrorBoundary Captured]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-cardDark p-8 rounded-2xl border border-red-200 dark:border-red-900/40 text-center shadow-lg">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh the page.'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
