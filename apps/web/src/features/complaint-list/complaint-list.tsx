import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { ComplaintCard } from "@/features/complaint-list/complaint-card";
import { ComplaintTableRow } from "@/features/complaint-list/complaint-table-row";
import { ComplaintToolbar } from "@/features/complaint-list/complaint-list-toolbar";
import { EmptyState } from "@/features/complaint-list/empty-state";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { ComplaintItem } from "@/features/complaint-list/types";

interface ComplaintListProps {
  complaints: ComplaintItem[];
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const columns: DataTableColumn[] = [
  { key: "id", label: "رقم الشكوى" },
  { key: "subject", label: "الموضوع" },
  { key: "citizen", label: "المواطن" },
  { key: "department", label: "القسم" },
  { key: "severity", label: "الأولوية" },
  { key: "status", label: "الحالة" },
  { key: "createdAt", label: "تاريخ الإنشاء" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function ComplaintList({
  complaints,
  totalPages,
  totalCount,
  pageSize,
}: ComplaintListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";

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

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = !!search;
  const isEmpty = complaints.length === 0;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <ComplaintToolbar
        search={search}
        onSearchSubmit={handleSearchChange}
        start={start}
        end={end}
        totalCount={totalCount}
      />

      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>

          <DataTable className="hidden lg:block">
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
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
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
