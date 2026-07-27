import type { User } from "@/features/user-list/types";
import { UserActionsDropdown } from "@/features/user-list/user-actions-dropdown";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { DataTableRow, DataTableCell } from "@/components/shared/data-table";

interface UserTableRowProps {
  user: User;
}

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar size="default" className="size-10">
            <AvatarImage src={user.avatar} alt={user.name} />
          </Avatar>
          <div>
            <p className="font-heading text-body-lg font-bold text-foreground">
              {user.name}
            </p>
            <p className="text-[12px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-foreground">
        {user.role}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-muted-foreground">
        {user.department}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        {user.status === "online" ? (
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-semibold">
            متصل الآن
          </span>
        ) : (
          <span className="bg-border/20 text-muted-foreground px-3 py-1 rounded-full text-[12px] font-semibold">
            غير نشط
          </span>
        )}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {user.lastSeen}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <UserActionsDropdown userId={user.id} userName={user.name} />
      </DataTableCell>
    </DataTableRow>
  );
}
