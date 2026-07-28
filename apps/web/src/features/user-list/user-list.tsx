import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { PaginationInfo } from "@/components/shared/pagination-info";
import { UserCard } from "@/features/user-list/user-card";
import { UserTableRow } from "@/features/user-list/user-table-row";
import { UserListToolbar } from "@/features/user-list/user-list-toolbar";
import { EmptyState } from "@/features/user-list/empty-state";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { User } from "@/features/user-list/types";

interface UserListProps {
  users: User[];
}

const PAGE_SIZE = 10;

const columns: DataTableColumn[] = [
  { key: "name", label: "اسم الموظف" },
  { key: "role", label: "الدور" },
  { key: "lastSeen", label: "تاريخ الإنشاء" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function UserList({ users }: UserListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const roleFilter = searchParams.get("role") ?? "";

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const totalCount = users.length;

  const paginatedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      prev.set(key, value);
      return prev;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("search", value);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleRoleFilterChange = (role: string | null) => {
    setSearchParams((prev) => {
      if (role) {
        prev.set("role", role);
      } else {
        prev.delete("role");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = !!(search || roleFilter);
  const isEmpty = users.length === 0;

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <UserListToolbar
        search={search}
        onSearchSubmit={handleSearchChange}
        roleFilter={roleFilter || null}
        onRoleFilterChange={handleRoleFilterChange}
      />

      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {paginatedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          <DataTable className="hidden lg:block">
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {paginatedUsers.map((user) => (
                <UserTableRow key={user.id} user={user} />
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}

      {!isEmpty && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setParam("page", String(page))}
            showGoto={false}
          />
          <PaginationInfo
            start={start}
            end={end}
            totalCount={totalCount}
            entity="موظف"
          />
        </div>
      )}
    </div>
  );
}
