import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { ComplaintCard } from "@/features/complaint-list/complaint-card";
import { ComplaintTableRow } from "@/features/complaint-list/complaint-table-row";
import { ComplaintToolbar } from "@/features/complaint-list/complaint-list-toolbar";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { Complaint } from "@/features/complaint-list/types";

interface ComplaintListProps {
  complaints: Complaint[];
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const columns: DataTableColumn[] = [
  { key: "id", label: "المعرف" },
  { key: "subject", label: "الموضوع" },
  { key: "category", label: "الفئة" },
  { key: "priority", label: "الأولوية" },
  { key: "status", label: "الحالة" },
  { key: "assignee", label: "المكلف" },
  {
    key: "actions",
    label: "الإجراءات",
    className: "text-center",
  },
];

export function ComplaintList({
  complaints,
  totalPages,
  totalCount,
  pageSize,
}: ComplaintListProps) {
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
      <ComplaintToolbar start={start} end={end} totalCount={totalCount} />

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

      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
