import { FileText } from "lucide-react";
import type { ReactNode } from "react";

import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { cn } from "@/lib/utils";

interface ReportResultTableProps {
  columns: DataTableColumn[];
  children: ReactNode;
  emptyText?: string;
  className?: string;
}

export function ReportResultTable({
  columns,
  children,
  emptyText = "لا توجد بيانات",
  className,
}: ReportResultTableProps) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <DataTable className={cn("overflow-x-auto", className)}>
      <DataTableHeader columns={columns} />
      <DataTableBody>
        {hasRows ? (
          children
        ) : (
          <tr>
            <td colSpan={columns.length} className="px-6 py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="size-8 text-muted-foreground/40" />
                <span className="text-body-sm">{emptyText}</span>
              </div>
            </td>
          </tr>
        )}
      </DataTableBody>
    </DataTable>
  );
}
