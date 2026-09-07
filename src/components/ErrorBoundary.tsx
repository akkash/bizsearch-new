import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 border border-destructive/30 rounded-full mb-6">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">
              Something Went Wrong
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              An unexpected error has occurred. Please try again.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 p-6 bg-card border border-border rounded-lg text-left overflow-auto max-h-64">
                <h3 className="font-semibold text-foreground mb-2">
                  Error Details:
                </h3>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-mono">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <h3 className="font-semibold text-foreground mb-2 mt-4">
                      Component Stack:
                    </h3>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.reload()}
                className="gap-2 bg-growth-green hover:bg-growth-green/90 text-white"
              >
                <RefreshCw className="h-5 w-5" />
                Reload Page
              </Button>
              <Link to="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Home className="h-5 w-5" />
                  Go to Homepage
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please{" "}
                <Link
                  to="/contact"
                  className="text-growth-green hover:underline font-medium"
                >
                  contact our support team
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
