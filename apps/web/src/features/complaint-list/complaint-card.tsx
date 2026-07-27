import type { Complaint } from "@/features/complaint-list/types";
import { ComplaintActionsDropdown } from "@/features/complaint-list/complaint-actions-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComplaintStatusBadge } from "@/features/complaint-list/complaint-status-badge";
import { ComplaintPriority } from "@/features/complaint-list/complaint-priority";

interface ComplaintCardProps {
  complaint: Complaint;
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-mono-data text-primary font-bold tracking-tight">
            {complaint.displayId}
          </span>
          <h3 className="font-heading text-headline-md text-foreground">
            {complaint.subject}
          </h3>
        </div>
        <ComplaintActionsDropdown complaintId={complaint.id} />
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-label-sm font-heading">
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">الفئة</p>
          <span className="text-foreground">{complaint.category}</span>
        </div>
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">الأولوية</p>
          <ComplaintPriority priority={complaint.priority} />
        </div>
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">المسؤول</p>
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
            <span className="text-foreground">{complaint.assignee.name}</span>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground opacity-70 mb-1">الحالة</p>
          <ComplaintStatusBadge status={complaint.status} />
        </div>
      </div>
    </div>
  );
}
