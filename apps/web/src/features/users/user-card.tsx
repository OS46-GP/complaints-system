import type { User } from "@/features/users/types";
import { UserActionsDropdown } from "@/features/users/user-actions-dropdown";
import { Badge } from "@/components/ui/badge";

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
    <div className="h-full bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-[1rem] text-foreground">
              {user.username}
            </h3>
            {user.isBlocked && (
              <Badge variant="destructive">محظور</Badge>
            )}
          </div>
          <p className="text-label-sm text-muted-foreground">
            {user.roleLabel}
          </p>
        </div>
        <UserActionsDropdown
          userId={user.id}
          userName={user.username}
          userRole={user.role}
          isBlocked={user.isBlocked}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <InfoItem label="البريد الإلكتروني" value={user.email || "-"} />
        <InfoItem label="الرقم القومي" value={user.nationalId || "-"} />
        <InfoItem label="تاريخ الإنشاء" value={user.lastSeen} />
      </div>
    </div>
  );
}
