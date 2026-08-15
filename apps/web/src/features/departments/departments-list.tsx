import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { PaginationInfo } from "@/components/shared/pagination-info";
import { Reveal } from "@/components/shared/reveal";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { DepartmentsToolbar } from "@/features/departments/departments-toolbar";
import { DepartmentCard } from "@/features/departments/department-card";
import { DepartmentActionsDropdown } from "@/features/departments/department-actions-dropdown";
import { EmptyState } from "@/features/departments/empty-state";
import type { Department } from "@/features/departments/types";

interface DepartmentsListProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const PAGE_SIZE = 10;

const columns: DataTableColumn[] = [
  { key: "name", label: "اسم الجهة" },
  { key: "subAuthority", label: "الجهة الفرعية" },
  { key: "createdAt", label: "تاريخ الإنشاء" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ar-SA");
}

export function DepartmentsList({ departments, onEdit }: DepartmentsListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const sort: SortState = {
    sortBy: searchParams.get("sortBy") || "name",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  };

  const totalPages = Math.max(1, Math.ceil(departments.length / PAGE_SIZE));
  const totalCount = departments.length;

  const paginatedDepartments = departments.slice(
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
      if (value) {
        prev.set("search", value);
      } else {
        prev.delete("search");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const handleSortChange = (newSort: SortState) => {
    setSearchParams((prev) => {
      prev.set("sortBy", newSort.sortBy);
      prev.set("sortOrder", newSort.sortOrder);
      prev.set("page", "1");
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = !!search;
  const isEmpty = departments.length === 0;

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <DepartmentsToolbar
        search={search}
        onSearchSubmit={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {paginatedDepartments.map((department, index) => (
              <Reveal key={department.id} delay={index * 90}>
                <DepartmentCard
                  department={department}
                  onEdit={() => onEdit(department)}
                />
              </Reveal>
            ))}
          </div>

          <DataTable className="hidden lg:block">
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {paginatedDepartments.map((department) => (
                <DepartmentRow
                  key={department.id}
                  department={department}
                  onEdit={() => onEdit(department)}
                />
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}

      {!isEmpty && totalPages > 1 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
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
            entity="جهة"
          />
        </div>
      )}
    </div>
  );
}

interface DepartmentRowProps {
  department: Department;
  onEdit: () => void;
}

function DepartmentRow({ department, onEdit }: DepartmentRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4">
        <p className="font-heading text-body-lg font-bold text-foreground">
          {department.name}
        </p>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-body text-body-md text-foreground">
        {department.subAuthority || <span className="text-muted-foreground">—</span>}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {formatDate(department.createdAt)}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <DepartmentActionsDropdown
          departmentId={department.id}
          departmentName={department.name}
          onEdit={onEdit}
        />
      </DataTableCell>
    </DataTableRow>
  );
}
