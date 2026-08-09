import { ArrowDownWideNarrow, Building2, CalendarDays, MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker, type DateRangeValue } from "@/features/reporting/components/date-range-picker";
import { DepartmentFilter } from "@/features/reporting/components/department-filter";
import { VillageFilter } from "@/features/reporting/components/village-filter";
import { cn } from "@/lib/utils";
import type { ReportFilters } from "@/features/reporting/types";

interface ReportingFilterBarProps {
  value: ReportFilters;
  onChange: (patch: Partial<ReportFilters>) => void;
  showVillage?: boolean;
  showSort?: boolean;
}

function FilterGroup({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="inline-flex items-center gap-1.5 font-heading text-label-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

export function ReportingFilterBar({
  value,
  onChange,
  showVillage,
  showSort,
}: ReportingFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4 rounded-xl border border-border bg-surface-container-lowest p-4">
      <FilterGroup
        icon={<CalendarDays className="size-4" />}
        label="الفترة"
      >
        <DateRangePicker
          value={{ from: value.from, to: value.to }}
          onChange={(range: DateRangeValue) =>
            onChange({ from: range.from, to: range.to })
          }
        />
      </FilterGroup>

      <FilterGroup
        icon={<Building2 className="size-4" />}
        label="الجهة"
      >
        <DepartmentFilter
          value={value.department ?? ""}
          onChange={(department) => onChange({ department })}
          className="w-56"
        />
      </FilterGroup>

      {showVillage && (
        <FilterGroup
          icon={<MapPin className="size-4" />}
          label="القرية / المركز"
        >
          <VillageFilter
            value={value.village ?? ""}
            onChange={(village) => onChange({ village })}
            className="w-56"
          />
        </FilterGroup>
      )}

      {showSort && (
        <FilterGroup
          icon={<ArrowDownWideNarrow className="size-4" />}
          label="الترتيب"
        >
          <Select
            value={value.sortBy ?? "default"}
            onValueChange={(v) => {
              const sortBy =
                v === "default"
                  ? undefined
                  : (v as "overdueCount" | "avgDaysOverdue");
              onChange({ sortBy, sortOrder: sortBy ? "desc" : undefined });
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الترتيب الافتراضي</SelectItem>
              <SelectItem value="overdueCount">الأكثر تأخرًا أولًا</SelectItem>
              <SelectItem value="avgDaysOverdue">
                أعلى متوسط أيام تأخير
              </SelectItem>
            </SelectContent>
          </Select>
        </FilterGroup>
      )}
    </div>
  );
}