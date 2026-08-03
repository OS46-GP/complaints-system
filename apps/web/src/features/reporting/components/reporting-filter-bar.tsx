import { Building2, CalendarDays } from "lucide-react";

import { DateRangePicker, type DateRangeValue } from "@/features/reporting/components/date-range-picker";
import { DepartmentFilter } from "@/features/reporting/components/department-filter";

interface ReportingFilterBarProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
}

export function ReportingFilterBar({
  dateRange,
  onDateRangeChange,
  department,
  onDepartmentChange,
}: ReportingFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface-container-lowest p-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-5 text-muted-foreground" />
        <span className="font-heading text-label-sm text-muted-foreground">
          الفترة
        </span>
      </div>
      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

      <div className="flex items-center gap-2">
        <Building2 className="size-5 text-muted-foreground" />
        <span className="font-heading text-label-sm text-muted-foreground">
          الجهة
        </span>
      </div>
      <DepartmentFilter value={department} onChange={onDepartmentChange} className="w-56" />
    </div>
  );
}
