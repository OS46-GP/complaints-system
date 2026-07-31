import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/shared/data-table";

const COLUMNS: DataTableColumn[] = [
  { key: "id", label: "رقم الشكوى" },
  { key: "subject", label: "الموضوع" },
  { key: "citizen", label: "المواطن" },
  { key: "department", label: "القسم" },
  { key: "severity", label: "الأولوية" },
  { key: "status", label: "الحالة" },
  { key: "createdAt", label: "تاريخ الإنشاء" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function ComplaintListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar className="flex-wrap gap-2 justify-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-5 w-36" />
      </DataTableToolbar>

      <div className="md:hidden grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
        <DataTable>
          <DataTableHeader columns={COLUMNS} />
          <DataTableBody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <DataTableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: 8 }).map((_, colIndex) => (
                  <DataTableCell key={colIndex} className="p-0 px-6 py-4">
                    <Skeleton
                      className={
                        colIndex === 7
                          ? "size-9 rounded-md mx-auto"
                          : "h-4 w-full max-w-28"
                      }
                    />
                  </DataTableCell>
                ))}
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
