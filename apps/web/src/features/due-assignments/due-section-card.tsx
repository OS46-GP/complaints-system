import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { DueRow, DueSectionLink } from "@/features/due-assignments/due-assignment-row";
import type { DueAssignmentRow } from "@/features/complaint-list/types";

interface DueSectionCardProps {
  icon: ReactNode;
  label: string;
  count: number;
  rows: DueAssignmentRow[];
  maxRows?: number;
  emptyText: string;
  skeletonText: string;
  detailsUrl?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPreview: (row: DueAssignmentRow) => void;
}

export function DueSectionCard({
  icon,
  label,
  count,
  rows,
  maxRows,
  emptyText,
  skeletonText,
  detailsUrl,
  isLoading,
  isError,
  onRetry,
  onPreview,
}: DueSectionCardProps) {
  const visibleRows = maxRows ? rows.slice(0, maxRows) : rows;

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-heading text-title-sm text-foreground flex items-center gap-1.5">
          {icon}
          {label}
          <span className="text-label-sm text-muted-foreground">
            ({count.toLocaleString("ar-SA")})
          </span>
        </h3>
        <DueSectionLink href={detailsUrl}>عرض الكل</DueSectionLink>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          {maxRows ? <Skeleton className="h-16 w-full" /> : null}
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-body-sm text-muted-foreground">{skeletonText}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-label-sm text-primary hover:underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !isError && (visibleRows.length > 0 ? (
        <ul className="space-y-2">
          {visibleRows.map((row) => (
            <DueRow key={row.assignmentId} row={row} onPreview={onPreview} />
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-muted-foreground">{emptyText}</p>
      ))}
    </section>
  );
}