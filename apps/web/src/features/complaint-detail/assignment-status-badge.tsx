import { Badge } from "@/components/ui/badge";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_VARIANT,
} from "@/features/complaint-detail/assignment-status";
import type { AssignmentStatus } from "@/features/complaint-detail/types";

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  return (
    <Badge
      variant={ASSIGNMENT_STATUS_VARIANT[status]}
      className="h-auto px-2 py-0.5 text-[0.625rem] font-semibold"
    >
      {ASSIGNMENT_STATUS_LABELS[status]}
    </Badge>
  );
}