import type { ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AsyncLoaderProps {
  loading?: boolean;
  error?: boolean;
  errorText?: string;
  onRetry?: () => void;
  skeleton?: ReactNode;
  className?: string;
  children?: ReactNode;
}

function DefaultSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-8">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
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
  errorText = "حدث خطأ أثناء تحميل البيانات",
  onRetry,
  skeleton,
  className,
  children,
}: AsyncLoaderProps) {
  if (loading) {
    return (
      <div className={cn("w-full", className)} aria-busy="true">
        {skeleton ?? <DefaultSkeleton />}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState text={errorText} onRetry={onRetry} className={className} />
    );
  }

  return (
    <div className="animate-in fade-in duration-300 ease-out fill-mode-both">
      {children}
    </div>
  );
}
