import { useState } from "react";
import { CalendarClock, Clock } from "lucide-react";

import { AsyncLoader } from "@/components/shared/async-loader";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplaintAssignmentDetailsDialog } from "@/features/complaint-detail/complaint-assignment-details-dialog";
import { useDueAssignments } from "@/features/complaint-list/hooks";
import {
  DueRow,
  DueSectionTitle,
} from "@/features/due-assignments/due-assignment-row";
import {
  complaintDetailHref,
  displayId,
  toAssignment,
} from "@/features/due-assignments/to-assignment";
import type { DueAssignmentRow } from "@/features/complaint-list/types";

export function DueAssignmentsPage() {
  const { data, isLoading, isError, refetch } = useDueAssignments();
  const [preview, setPreview] = useState<DueAssignmentRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="إحالات بانتظار الرد"
        description="إحالات تنتهي اليوم أو تجاوزت المهلة ولم يرد عنها بعد — لمتابعة وإرسال استعجال"
      />

      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل الإحالات المنتظرة"
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        }
      >
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-3">
              <DueSectionTitle
                icon={<CalendarClock className="size-4 text-warning" />}
                label="تنتهي اليوم دون رد"
                count={data.counts.endingToday}
              />
              {data.endingToday.length > 0 ? (
                <ul className="space-y-2">
                  {data.endingToday.map((row) => (
                    <DueRow
                      key={row.assignmentId}
                      row={row}
                      onPreview={(r) => {
                        setPreview(r);
                        setDialogOpen(true);
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-border bg-surface-container-lowest p-4 text-body-md text-muted-foreground">
                  لا توجد إحالات تنتهي اليوم دون رد.
                </div>
              )}
            </section>

            <section className="space-y-3">
              <DueSectionTitle
                icon={<Clock className="size-4 text-destructive" />}
                label="متأخرة دون رد"
                count={data.counts.overdue}
              />
              {data.overdue.length > 0 ? (
                <ul className="space-y-2">
                  {data.overdue.map((row) => (
                    <DueRow
                      key={row.assignmentId}
                      row={row}
                      onPreview={(r) => {
                        setPreview(r);
                        setDialogOpen(true);
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-border bg-surface-container-lowest p-4 text-body-md text-muted-foreground">
                  لا توجد إحالات متأخرة دون رد.
                </div>
              )}
            </section>
          </div>
        )}
      </AsyncLoader>

      {preview && (
        <ComplaintAssignmentDetailsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          displayId={displayId(preview)}
          assignment={toAssignment(preview)}
          complaintHref={complaintDetailHref(preview.complaintId, window.location.pathname)}
        />
      )}
    </div>
  );
}