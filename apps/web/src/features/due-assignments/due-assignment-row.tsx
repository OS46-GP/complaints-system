import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AssignmentStatusBadge } from "@/features/complaint-detail/assignment-status-badge";
import { formatDate } from "@/features/complaint-detail/assignment-status";
import {
  complaintDetailHref,
  displayId,
} from "@/features/due-assignments/to-assignment";
import type { DueAssignmentRow } from "@/features/complaint-list/types";

interface DueAssignmentRowProps {
  row: DueAssignmentRow;
  onPreview: (row: DueAssignmentRow) => void;
}

export function DueRow({ row, onPreview }: DueAssignmentRowProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <li className="rounded-lg border border-border bg-surface-container-low p-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(complaintDetailHref(row.complaintId, pathname))}
          className="text-right flex-1 min-w-0"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-label-sm text-foreground">
              {row.departmentName}
            </span>
            <span className="text-label-xs text-muted-foreground">
              {displayId(row)}
            </span>
            <AssignmentStatusBadge status={row.status} />
          </div>
          <p className="text-body-sm text-muted-foreground mt-0.5 line-clamp-1">
            {row.subject} — {formatDate(row.dueDate)}
          </p>
        </button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="معاينة الإحالة"
          onClick={() => onPreview(row)}
        >
          <Eye className="size-4" />
        </Button>
      </div>
    </li>
  );
}

export function DueSectionLink({ href, children }: { href?: string; children: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-label-sm text-primary hover:underline"
    >
      {children}
      <ArrowLeft className="size-4" />
    </a>
  );
}

export function DueSectionTitle({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-heading text-label-sm text-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </h3>
      <span className="font-heading text-label-sm text-foreground">
        {count.toLocaleString("ar-SA")}
      </span>
    </div>
  );
}