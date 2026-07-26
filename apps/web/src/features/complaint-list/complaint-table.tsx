import { useSearchParams } from "react-router";
import { TablePagination } from "@/components/shared/table-pagination";
import { ComplaintTableRow } from "@/features/complaint-list/complaint-table-row";
import { ComplaintTableToolbar } from "@/features/complaint-list/complaint-table-toolbar";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableFooter,
  type DataTableColumn,
} from "@/components/shared/data-table";
import type { Complaint } from "@/features/complaint-list/types";

interface ComplaintTableProps {
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

export function ComplaintTable({
  complaints,
  totalPages,
  totalCount,
  pageSize,
}: ComplaintTableProps) {
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
    <DataTable
      toolbar={
        <ComplaintTableToolbar
          start={start}
          end={end}
          totalCount={totalCount}
        />
      }
    >
      <DataTableHeader columns={columns} />

      <DataTableBody>
        {complaints.map((complaint) => (
          <ComplaintTableRow
            key={complaint.id}
            complaint={complaint}
          />
        ))}
      </DataTableBody>

      <DataTableFooter>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </DataTableFooter>
    </DataTable>
  );
}
