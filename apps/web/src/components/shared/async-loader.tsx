import type { ReactNode } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AsyncLoaderProps {
  loading?: boolean;
  error?: boolean;
  loadingText?: string;
  errorText?: string;
  onRetry?: () => void;
  className?: string;
  children?: ReactNode;
}

function LoaderState({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20",
        className,
      )}
    >
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <span className="font-body text-body-md text-muted-foreground">
        {text}
      </span>
    </div>
  );
}

function ErrorState({
  text,
  onRetry,
  className,
}: {
  text: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20",
        className,
      )}
    >
      <AlertCircle className="size-8 text-destructive" />
      <span className="font-body text-body-md text-muted-foreground">
        {text}
      </span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RotateCcw className="size-4" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

export function AsyncLoader({
  loading,
  error,
  loadingText = "جارٍ التحميل...",
  errorText = "حدث خطأ أثناء تحميل البيانات",
  onRetry,
  className,
  children,
}: AsyncLoaderProps) {
  if (loading) {
    return <LoaderState text={loadingText} className={className} />;
  }

  if (error) {
    return <ErrorState text={errorText} onRetry={onRetry} className={className} />;
  }

  return <>{children}</>;
}
