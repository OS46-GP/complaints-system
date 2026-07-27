import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { PaginationInfo } from "@/components/shared/pagination-info";
import { UserCard } from "@/features/user-list/user-card";
import { UserTableRow } from "@/features/user-list/user-table-row";
import { UserListToolbar } from "@/features/user-list/user-list-toolbar";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { User } from "@/features/user-list/types";

interface UserListProps {
  users: User[];
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const columns: DataTableColumn[] = [
  { key: "name", label: "اسم الموظف" },
  { key: "role", label: "الدور" },
  { key: "department", label: "القسم" },
  { key: "status", label: "الحالة", className: "text-center" },
  { key: "lastSeen", label: "آخر ظهور" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function UserList({
  users,
  totalPages,
  totalCount,
  pageSize,
}: UserListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
  };

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <UserListToolbar />

      <div className="lg:hidden grid grid-cols-1 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      <DataTable className="hidden lg:block">
        <DataTableHeader columns={columns} />
        <DataTableBody>
          {users.map((user) => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </DataTableBody>
      </DataTable>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showGoto={false}
        />
        <PaginationInfo
          start={start}
          end={end}
          totalCount={totalCount}
          entity="موظف"
        />
      </div>
    </div>
  );
}
