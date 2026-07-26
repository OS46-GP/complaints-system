import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface DataTableColumn {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

export function DataTable({ children, toolbar, className }: DataTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {toolbar}
      <Table>{children}</Table>
    </div>
  );
}

interface DataTableToolbarProps {
  children: ReactNode;
  className?: string;
}

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between border-b border-border bg-background/50 px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface DataTableHeaderProps {
  columns: DataTableColumn[];
  className?: string;
}

export function DataTableHeader({ columns, className }: DataTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className={cn("bg-muted/30 hover:bg-muted/30", className)}>
        {columns.map((col) => (
          <TableHead
            key={col.key}
            className={cn(
              "h-auto px-6 py-4 font-heading text-label-sm font-semibold",
              col.className,
            )}
          >
            {col.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

interface DataTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return <TableBody className={className}>{children}</TableBody>;
}

export { TableRow as DataTableRow, TableCell as DataTableCell };

interface DataTableFooterProps {
  children: ReactNode;
  colSpan?: number;
  className?: string;
}

export function DataTableFooter({
  children,
  colSpan = 7,
  className,
}: DataTableFooterProps) {
  return (
    <TableFooter
      className={cn("bg-background/50 font-normal", className)}
    >
      <TableRow>
        <TableCell colSpan={colSpan} className="p-0">
          {children}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
