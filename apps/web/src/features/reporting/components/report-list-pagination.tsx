import { ListPagination } from "@/components/shared/list-pagination";
import { PaginationInfo } from "@/components/shared/pagination-info";

interface ReportListPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  entity?: string;
  className?: string;
}

export function ReportListPagination({
  page,
  totalPages,
  onPageChange,
  total,
  entity = "شكوى",
  className,
}: ReportListPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * Math.max(1, Math.ceil(total / totalPages)) + 1;
  const end = Math.min(page * Math.max(1, Math.ceil(total / totalPages)), total);

  return (
    <div
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-surface-container-lowest px-6 py-4 ${className ?? ""}`}
    >
      <PaginationInfo start={start} end={end} totalCount={total} entity={entity} />
      <ListPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showGoto={false}
      />
    </div>
  );
}