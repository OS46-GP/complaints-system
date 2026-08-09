import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportTableSkeleton } from "@/features/reporting/components/report-skeletons";

interface ReportSectionProps {
  title?: string;
  description?: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  errorText?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}

export function ReportSection({
  title,
  description,
  loading,
  error,
  onRetry,
  errorText = "تعذر تحميل التقرير",
  skeleton,
  children,
}: ReportSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      {(title || description) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-label-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {!loading && !error && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="size-4" />
              تحديث
            </Button>
          )}
        </div>
      )}

      {loading ? (
        skeleton ?? <ReportTableSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <AlertTriangle className="size-10 text-destructive/60" />
          <p className="font-heading text-body-lg font-semibold text-foreground">
            {errorText}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" />
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        children
      )}
    </section>
  );
}