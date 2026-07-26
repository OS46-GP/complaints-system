import type { Complaint } from "@/types/complaint.types";
import { ComplaintActionsDropdown } from "@/components/complaint-actions-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComplaintStatusBadge } from "@/components/complaint-status-badge";
import { ComplaintPriority } from "@/components/complaint-priority";
import { DataTableRow, DataTableCell } from "@/components/data-table";

interface ComplaintTableRowProps {
  complaint: Complaint;
}

export function ComplaintTableRow({
  complaint,
}: ComplaintTableRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low">
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data font-bold">
        {complaint.displayId}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <div className="flex flex-col">
          <span className="font-heading text-label-sm font-bold text-foreground">
            {complaint.subject}
          </span>
          <span className="text-[12px] text-muted-foreground">
            {complaint.timeAgo}
          </span>
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-heading text-label-sm">
        {complaint.category}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <ComplaintPriority priority={complaint.priority} />
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <ComplaintStatusBadge status={complaint.status} />
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {complaint.assignee.avatar ? (
              <AvatarImage
                src={complaint.assignee.avatar}
                alt={complaint.assignee.name}
              />
            ) : null}
            <AvatarFallback>
              {complaint.assignee.initials ??
                complaint.assignee.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="font-heading text-label-sm">
            {complaint.assignee.name}
          </span>
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <ComplaintActionsDropdown complaintId={complaint.id} />
      </DataTableCell>
    </DataTableRow>
  );
}
