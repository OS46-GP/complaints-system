import { useNavigate, useLocation } from "react-router";
import type { ComplaintItem } from "@/features/complaint-list/types";
import { ComplaintActionsDropdown } from "@/features/complaint-list/complaint-actions-dropdown";
import { ComplaintPriority } from "@/features/complaint-list/complaint-priority";
import { ComplaintStatusBadge } from "@/features/complaint-list/complaint-status-badge";
import { DataTableRow, DataTableCell } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PATHS } from "@/router/paths";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ComplaintTableRowProps {
  complaint: ComplaintItem;
  selected: boolean;
  onToggle: () => void;
}

export function ComplaintTableRow({
  complaint,
  selected,
  onToggle,
}: ComplaintTableRowProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const detailPath = isAdmin
    ? PATHS.ADMIN.COMPLAINT_DETAIL(complaint.id)
    : PATHS.USER.COMPLAINT_DETAIL(complaint.id);

  return (
    <DataTableRow
      className={cn(
        "hover:bg-surface-container-low transition-colors group cursor-pointer",
        selected && "bg-primary/5",
      )}
      onClick={() => navigate(detailPath)}
    >
      <DataTableCell
        className="p-0 px-6 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`اختيار الشكوى ${complaint.displayId}`}
        />
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data font-bold text-primary">
        {complaint.displayId}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 max-w-64">
        <div className="flex flex-col">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-heading text-label-sm font-bold text-foreground truncate">
                {complaint.subject}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              {complaint.subject}
            </TooltipContent>
          </Tooltip>
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-foreground whitespace-normal break-words">
        {complaint.citizenName}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-muted-foreground whitespace-normal break-words">
        {complaint.departmentName}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <div className="flex flex-col items-start gap-1.5">
          <ComplaintPriority severity={complaint.severity} />
          <ComplaintStatusBadge status={complaint.caseStatus} label={complaint.statusLabel} variant={complaint.statusVariant} />
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {complaint.createdAt}
      </DataTableCell>
      <DataTableCell
        className="p-0 px-6 py-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <ComplaintActionsDropdown complaintId={complaint.id} />
      </DataTableCell>
    </DataTableRow>
  );
}
