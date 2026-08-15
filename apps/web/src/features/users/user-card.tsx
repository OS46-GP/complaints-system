import { ShieldBan } from "lucide-react";
import type { User } from "@/features/users/types";
import { UserActionsDropdown } from "@/features/users/user-actions-dropdown";

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="bg-surface-container-low p-2 rounded-lg min-w-0">
      <span className="text-[0.6875rem] text-muted-foreground block mb-1">
        {label}
      </span>
      <span className="text-body-md font-medium text-foreground break-all min-w-0">
        {value}
      </span>
    </div>
  );
}

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-heading text-[1rem] text-foreground">
            {user.username}
          </h3>
          <p className="text-label-sm text-muted-foreground">
            {user.roleLabel}
          </p>
        </div>
        {user.role !== "Admin" ? (
          <UserActionsDropdown userId={user.id} userName={user.username} />
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
            <ShieldBan className="size-4" />
            لا يوجد صلاحية
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <InfoItem label="البريد الإلكتروني" value={user.email || "-"} />
        <InfoItem label="تاريخ الإنشاء" value={user.lastSeen} />
      </div>
    </div>
  );
}
