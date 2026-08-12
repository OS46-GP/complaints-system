import { useState } from "react";
import { CalendarClock, Clock } from "lucide-react";

import { ComplaintAssignmentDetailsDialog } from "@/features/complaint-detail/complaint-assignment-details-dialog";
import { useDueAssignments } from "@/features/complaint-list/hooks";
import { DueSectionCard } from "@/features/due-assignments/due-section-card";
import {
  complaintDetailHref,
  displayId,
  toAssignment,
} from "@/features/due-assignments/to-assignment";
import type { DueAssignmentRow } from "@/features/complaint-list/types";

const MAX_ROWS = 4;

interface DueAssignmentsCardProps {
  detailsUrl?: string;
}

export function DueAssignmentsCard({ detailsUrl }: DueAssignmentsCardProps) {
  const { data, isLoading, isError, refetch } = useDueAssignments();
  const [preview, setPreview] = useState<DueAssignmentRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePreview = (row: DueAssignmentRow) => {
    setPreview(row);
    setDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DueSectionCard
        icon={<CalendarClock className="size-5 text-warning" />}
        label="تنتهي اليوم دون رد"
        count={data?.counts.endingToday ?? 0}
        rows={data?.endingToday ?? []}
        maxRows={MAX_ROWS}
        emptyText="لا توجد إحالات تنتهي اليوم دون رد."
        skeletonText="تعذر تحميل الإحالات المنتهية اليوم"
        detailsUrl={detailsUrl}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onPreview={handlePreview}
      />

      <DueSectionCard
        icon={<Clock className="size-5 text-destructive" />}
        label="متأخرة دون رد"
        count={data?.counts.overdue ?? 0}
        rows={data?.overdue ?? []}
        maxRows={MAX_ROWS}
        emptyText="لا توجد إحالات متأخرة دون رد."
        skeletonText="تعذر تحميل الإحالات المتأخرة"
        detailsUrl={detailsUrl}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onPreview={handlePreview}
      />

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