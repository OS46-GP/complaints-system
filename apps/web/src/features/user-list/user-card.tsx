import type { User } from "@/features/user-list/types";
import { UserActionsDropdown } from "@/features/user-list/user-actions-dropdown";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type InfoItemVariant = "default" | "primary";

interface InfoItemProps {
  label: string;
  value: string;
  variant?: InfoItemVariant;
  indicator?: "online" | "offline";
}

function InfoItem({
  label,
  value,
  variant = "default",
  indicator,
}: InfoItemProps) {
  return (
    <div className="bg-surface-container-low p-2 rounded-lg min-w-0">
      <span className="text-[11px] text-muted-foreground block mb-1">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {indicator && (
          <span
            className={cn(
              "size-2 rounded-full",
              indicator === "online" ? "bg-green-500" : "bg-slate-400",
            )}
          />
        )}
        <span
          className={cn(
            "text-body-md font-medium break-all min-w-0",
            variant === "primary" && "text-primary",
            variant === "default" && "text-foreground",
            indicator === "offline" && "text-muted-foreground",
          )}
        >
          {value}
        </span>
      </div>
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
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full relative">
            <Avatar size="lg" className="size-12">
              <AvatarImage src={user.avatar} alt={user.name} />
            </Avatar>
            <span
              className={`absolute bottom-0.5 right-0.5 size-2.5 rounded-full border-2 border-surface-container-lowest ${
                user.status === "online" ? "bg-green-500" : "bg-slate-400"
              }`}
            />
          </div>
          <div>
            <h3 className="font-heading text-[16px] text-foreground">
              {user.name}
            </h3>
            <p className="text-label-sm text-muted-foreground">
              {user.roleTitle}
            </p>
          </div>
        </div>
        <UserActionsDropdown userId={user.id} userName={user.name} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
        <InfoItem label="القسم" value={user.department} variant="primary" />
        <InfoItem label="البريد الإلكتروني" value={user.email} />
        <InfoItem
          label="الحالة"
          value={user.status === "online" ? "متصل الآن" : "غير متصل"}
          indicator={user.status}
        />
        <InfoItem label="آخر ظهور" value={user.lastSeen} />
      </div>
    </div>
  );
}
