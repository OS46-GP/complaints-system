import type { ComplaintItem } from "@/features/complaint-list/types";
import { ComplaintActionsDropdown } from "@/features/complaint-list/complaint-actions-dropdown";
import { ComplaintStatusBadge } from "@/features/complaint-list/complaint-status-badge";
import { ComplaintPriority } from "@/features/complaint-list/complaint-priority";

interface ComplaintCardProps {
  complaint: ComplaintItem;
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-mono-data text-primary font-bold tracking-tight">
            {complaint.displayId}
          </span>
          <h3 className="font-heading text-headline-md text-foreground">
            {complaint.subject}
          </h3>
        </div>
        <ComplaintActionsDropdown complaintId={complaint.id} complaintLabel={complaint.displayId} />
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-label-sm font-heading">
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">المواطن</p>
          <span className="text-foreground">{complaint.citizenName}</span>
        </div>
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">القسم</p>
          <span className="text-foreground">{complaint.departmentName}</span>
        </div>
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">الأولوية</p>
          <ComplaintPriority severity={complaint.severity} />
        </div>
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">الحالة</p>
          <ComplaintStatusBadge status={complaint.caseStatus} label={complaint.statusLabel} variant={complaint.statusVariant} />
        </div>
      </div>
    </div>
  );
}
