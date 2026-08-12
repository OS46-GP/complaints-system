import { ArrowUp, ArrowDown, CalendarClock, Clock } from "lucide-react";
import { useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchForm } from "@/components/shared/search-form";
import { DataTableToolbar } from "@/components/shared/data-table";
import { PATHS } from "@/router/paths";
import { ComplaintFilterSheet, type FilterValues } from "@/features/complaint-list/complaint-filter-sheet";
import { NewComplaintButton } from "@/features/complaint-list/new-complaint-button";
import type { SortState } from "@/features/complaint-list/complaint-list";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface ComplaintToolbarProps {
  search: string;
  onSearchSubmit: (value: string) => void;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onFiltersClear: () => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  quickDueToday?: boolean;
  quickOverdue?: boolean;
  onToggleQuickFilter?: (key: "dueToday" | "overdueUnresponded") => void;
  start: number;
  end: number;
  totalCount: number;
}

const SORT_OPTIONS = [
  { value: "createdAt", label: "تاريخ الإنشاء" },
  { value: "complaintNumber", label: "رقم الشكوى" },
  { value: "severity", label: "الأولوية" },
  { value: "subject", label: "الموضوع" },
];

export function ComplaintToolbar({
  search,
  onSearchSubmit,
  filters,
  onFiltersChange,
  onFiltersClear,
  sort,
  onSortChange,
  quickDueToday,
  quickOverdue,
  onToggleQuickFilter,
  start,
  end,
  totalCount,
}: ComplaintToolbarProps) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const newComplaintPath = isAdmin
    ? PATHS.ADMIN.NEW_COMPLAINT
    : PATHS.USER.NEW_COMPLAINT;

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort.sortBy)?.label ?? "ترتيب";

  const handleSortSelect = (value: string) => {
    if (value === sort.sortBy) {
      onSortChange({
        sortBy: value,
        sortOrder: sort.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ sortBy: value, sortOrder: "desc" });
    }
  };

  return (
    <DataTableToolbar className="flex-wrap gap-2 justify-center sm:justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <SearchForm
          defaultValue={search}
          onSubmit={onSearchSubmit}
          placeholder="بحث بالاسم أو الموضوع أو الرقم"
          inputClassName="w-48"
        />
        <ComplaintFilterSheet
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClear={onFiltersClear}
        />
        {onToggleQuickFilter && (
          <>
            <Button
              variant={quickDueToday ? "default" : "outline"}
              size="sm"
              className="gap-1 md:gap-2"
              onClick={() => onToggleQuickFilter("dueToday")}
              aria-pressed={quickDueToday}
            >
              <CalendarClock className="size-4 text-warning" />
              <span className="hidden sm:inline">تنتهي اليوم</span>
            </Button>
            <Button
              variant={quickOverdue ? "default" : "outline"}
              size="sm"
              className="gap-1 md:gap-2"
              onClick={() => onToggleQuickFilter("overdueUnresponded")}
              aria-pressed={quickOverdue}
            >
              <Clock className="size-4 text-destructive" />
              <span className="hidden sm:inline">متأخرة دون رد</span>
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 md:gap-2">
              {sort.sortOrder === "asc" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
              <span className="hidden sm:inline">{currentLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuRadioGroup
              value={sort.sortBy}
              onValueChange={handleSortSelect}
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    {option.label}
                    {sort.sortBy === option.value && (
                      sort.sortOrder === "asc" ? (
                        <ArrowUp className="size-3.5 text-muted-foreground" />
                      ) : (
                        <ArrowDown className="size-3.5 text-muted-foreground" />
                      )
                    )}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-6" />
        <NewComplaintButton newComplaintPath={newComplaintPath} ocrPath={isAdmin ? PATHS.ADMIN.COMPLAINT_OCR : PATHS.USER.COMPLAINT_OCR} />
      </div>
      <p className="font-heading text-body-lg text-muted-foreground whitespace-nowrap text-center">
        {start.toLocaleString("ar-SA")}–{end.toLocaleString("ar-SA")}
        {" "}
        من أصل {totalCount.toLocaleString("ar-SA")}
      </p>
    </DataTableToolbar>
  );
}
