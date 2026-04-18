import React, { ReactNode, ErrorInfo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log error to backend
    fetch("/api/logs/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        info: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  handleReset = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4" dir="rtl">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2rem]">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">عذراً، حدث خطأ غير متوقع</h1>
              <p className="text-muted-foreground text-sm">
                واجهنا مشكلة تقنية في تحميل هذه الصفحة. لقد تم تسجيل الخطأ وسنعمل على إصلاحه.
              </p>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="text-xs bg-muted p-4 rounded-xl overflow-auto text-left dir-ltr max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <Button 
              onClick={this.handleReset}
              className="w-full gap-2 rounded-xl"
              variant="default"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4" />
              تحديث الصفحة والعودة للرئيسية
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
