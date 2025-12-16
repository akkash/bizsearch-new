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
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Oops! Something Went Wrong
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're sorry for the inconvenience. An unexpected error has occurred.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg text-left overflow-auto max-h-64">
                <h3 className="font-semibold text-red-900 mb-2">
                  Error Details:
                </h3>
                <pre className="text-sm text-red-800 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <h3 className="font-semibold text-red-900 mb-2 mt-4">
                      Component Stack:
                    </h3>
                    <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => window.location.reload()}
                className="gap-2"
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

            {/* Help Text */}
            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please{" "}
                <Link
                  to="/contact"
                  className="text-primary hover:underline font-medium"
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
