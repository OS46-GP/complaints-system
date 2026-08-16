import type { User } from "@/features/users/types";
import { UserActionsDropdown } from "@/features/users/user-actions-dropdown";
import { Badge } from "@/components/ui/badge";
import { DataTableRow, DataTableCell } from "@/components/shared/data-table";

interface UserTableRowProps {
  user: User;
}

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-heading text-body-lg font-bold text-foreground">
              {user.username}
            </p>
            {user.isBlocked && (
              <Badge variant="destructive">محظور</Badge>
            )}
          </div>
          {user.email && (
            <p className="text-[0.75rem] text-muted-foreground">{user.email}</p>
          )}
        </div>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-foreground">
        {user.roleLabel}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-foreground">
        {user.nationalId || "-"}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {user.lastSeen}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <UserActionsDropdown
          userId={user.id}
          userName={user.username}
          userRole={user.role}
          isBlocked={user.isBlocked}
        />
      </DataTableCell>
    </DataTableRow>
  );
}
