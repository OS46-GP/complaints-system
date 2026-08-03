import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { ComplaintCard } from "@/features/complaint-list/complaint-card";
import { ComplaintTableRow } from "@/features/complaint-list/complaint-table-row";
import { ComplaintToolbar } from "@/features/complaint-list/complaint-list-toolbar";
import { EmptyState } from "@/features/complaint-list/empty-state";
import type { FilterValues } from "@/features/complaint-list/complaint-filter-sheet";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { ComplaintItem } from "@/features/complaint-list/types";

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface ComplaintListProps {
  complaints: ComplaintItem[];
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const columns: DataTableColumn[] = [
  { key: "id", label: "رقم الشكوى", className: "w-28" },
  { key: "subject", label: "الموضوع", className: "w-64" },
  { key: "citizen", label: "المواطن", className: "w-40" },
  { key: "department", label: "القسم", className: "w-40" },
  { key: "severity", label: "الأولوية", className: "w-24" },
  { key: "status", label: "الحالة", className: "w-32" },
  { key: "createdAt", label: "تاريخ الإنشاء", className: "w-36" },
  { key: "actions", label: "الإجراءات", className: "w-20 text-center" },
];

function filtersFromParams(params: URLSearchParams): FilterValues {
  return {
    departmentId: params.get("departmentId") ?? "",
    severity: params.get("severity") ?? "",
    complaintTypeId: params.get("complaintTypeId") ?? "",
    examinationStatusId: params.get("examinationStatusId") ?? "",
    receptionMethodId: params.get("receptionMethodId") ?? "",
    presentationStatusId: params.get("presentationStatusId") ?? "",
    complaintNumber: params.get("complaintNumber") ?? "",
    statementYear: params.get("statementYear") ?? "",
  };
}

function sortFromParams(params: URLSearchParams): SortState {
  const sortBy = params.get("sortBy") || "createdAt";
  const sortOrder = (params.get("sortOrder") as "asc" | "desc") || "desc";
  return { sortBy, sortOrder };
}

export function ComplaintList({
  complaints,
  totalPages,
  totalCount,
  pageSize,
}: ComplaintListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const filters = filtersFromParams(searchParams);
  const sort = sortFromParams(searchParams);

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
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

  const handleFiltersChange = (newFilters: FilterValues) => {
    setSearchParams((prev) => {
      for (const [key, value] of Object.entries(newFilters)) {
        if (value) prev.set(key, value);
        else prev.delete(key);
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

  const hasFilters = !!search || Object.values(filters).some((v) => v !== "");
  const isEmpty = complaints.length === 0;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <ComplaintToolbar
        search={search}
        onSearchSubmit={handleSearchChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onFiltersClear={clearFilters}
        sort={sort}
        onSortChange={handleSortChange}
        start={start}
        end={end}
        totalCount={totalCount}
      />

      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="md:hidden grid grid-cols-1 gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>

          <DataTable
            className="hidden md:block w-full overflow-x-auto"
            tableClassName="table-fixed"
          >
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {complaints.map((complaint) => (
                <ComplaintTableRow key={complaint.id} complaint={complaint} />
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}

      {!isEmpty && totalPages > 1 && (
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
