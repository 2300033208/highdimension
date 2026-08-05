import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-6">
          <div className="max-w-2xl w-full card p-8 sm:p-12 relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-0 w-full h-2 bg-danger" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-danger/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative z-10">
              <div className="shrink-0 h-16 w-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center shadow-inner">
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-ink">Application Error</h1>
                <p className="text-sm text-ink-dim max-w-lg">
                  We encountered an unexpected error while rendering this page. The engineering team has been notified.
                </p>
              </div>
            </div>

            <div className="bg-[var(--color-surface-raised)] border border-[var(--color-glass-border)] rounded-xl p-4 mb-8 overflow-x-auto">
              <p className="text-danger font-mono text-sm font-semibold mb-2">
                {this.state.error?.toString()}
              </p>
              <pre className="text-ink-faint text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-70">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button 
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all duration-200 bg-accent text-white hover:opacity-90 hover:shadow-lg hover:shadow-accent/20"
              >
                <RefreshCcw className="h-4 w-4" />
                Reload Page
              </button>
              <button 
                onClick={this.handleHome}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all duration-200 bg-[var(--color-glass-input)] text-ink border border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]"
              >
                <Home className="h-4 w-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
