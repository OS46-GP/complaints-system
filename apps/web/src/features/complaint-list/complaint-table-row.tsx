import type { ComplaintItem } from "@/features/complaint-list/types";
import { ComplaintActionsDropdown } from "@/features/complaint-list/complaint-actions-dropdown";
import { ComplaintPriority } from "@/features/complaint-list/complaint-priority";
import { ComplaintStatusBadge } from "@/features/complaint-list/complaint-status-badge";
import { DataTableRow, DataTableCell } from "@/components/shared/data-table";

interface ComplaintTableRowProps {
  complaint: ComplaintItem;
}

export function ComplaintTableRow({ complaint }: ComplaintTableRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data font-bold text-primary">
        {complaint.displayId}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <div className="flex flex-col">
          <span className="font-heading text-label-sm font-bold text-foreground">
            {complaint.subject}
          </span>
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-foreground">
        {complaint.citizenName}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-muted-foreground">
        {complaint.departmentName}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <ComplaintPriority severity={complaint.severity} />
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <ComplaintStatusBadge status={complaint.caseStatus} label={complaint.statusLabel} variant={complaint.statusVariant} />
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {complaint.createdAt}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <ComplaintActionsDropdown complaintId={complaint.id} />
      </DataTableCell>
    </DataTableRow>
  );
}
