import { ShieldBan } from "lucide-react";
import type { User } from "@/features/users/types";
import { UserActionsDropdown } from "@/features/users/user-actions-dropdown";
import { DataTableRow, DataTableCell } from "@/components/shared/data-table";

interface UserTableRowProps {
  user: User;
}

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4">
        <div>
          <p className="font-heading text-body-lg font-bold text-foreground">
            {user.username}
          </p>
          {user.email && (
            <p className="text-[12px] text-muted-foreground">{user.email}</p>
          )}
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-foreground">
        {user.roleLabel}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {user.lastSeen}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        {user.role !== "Admin" ? (
          <UserActionsDropdown userId={user.id} userName={user.username} />
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
            <ShieldBan className="size-4" />
            لا يوجد صلاحية
          </span>
        )}
      </DataTableCell>
    </DataTableRow>
  );
}
