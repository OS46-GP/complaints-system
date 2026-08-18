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
  { key: "key", label: "المفتاح" },
  { key: "labelAr", label: "الاسم الظاهر" },
  { key: "type", label: "النوع" },
  { key: "defaultValue", label: "القيمة الافتراضية" },
  { key: "isActive", label: "الحالة" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function LetterVariablesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <DataTable>
        <DataTableHeader columns={COLUMNS} />
        <DataTableBody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <DataTableRow key={rowIndex} className="hover:bg-transparent">
              {Array.from({ length: COLUMNS.length }).map((_, colIndex) => (
                <DataTableCell key={colIndex} className="px-6 py-4">
                  <Skeleton
                    className={
                      colIndex === COLUMNS.length - 1
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
  );
}