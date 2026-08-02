import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type DataTableColumn,
} from "@/components/shared/data-table";

const COLUMNS: DataTableColumn[] = [
  { key: "name", label: "اسم الجهة" },
  { key: "subAuthority", label: "الجهة الفرعية" },
  { key: "createdAt", label: "تاريخ الإنشاء" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="size-9 rounded-full" />
      </div>
    </div>
  );
}

export function DepartmentsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-col md:flex-row-reverse md:items-center md:justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="lg:hidden grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
        <DataTable>
          <DataTableHeader columns={COLUMNS} />
          <DataTableBody>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <DataTableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <DataTableCell key={colIndex} className="p-0 px-6 py-4">
                    <Skeleton
                      className={
                        colIndex === 3
                          ? "size-9 rounded-md mx-auto"
                          : "h-4 w-full max-w-32"
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
