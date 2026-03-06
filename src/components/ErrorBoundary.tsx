import React, { ReactNode, ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
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
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-700">
                We encountered an unexpected error. Please try one of the options below:
              </p>
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 bg-red-100 rounded-md border border-red-300">
                  <p className="font-mono text-xs text-red-900 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <p className="font-mono text-xs text-red-800 mt-2 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => { this.handleReset(); window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); }}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Go Home
                </Button>
                <Button
                  onClick={() => this.handleReset()}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
