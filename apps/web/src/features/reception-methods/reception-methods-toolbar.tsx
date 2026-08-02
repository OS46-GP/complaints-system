import { ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/shared/search-form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import type { SortState } from "@/features/reception-methods/reception-methods-list";

interface ReceptionMethodsToolbarProps {
  search: string;
  onSearchSubmit: (value: string) => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
}

const SORT_OPTIONS = [
  { value: "id", label: "الرقم" },
  { value: "name", label: "اسم طريقة الاستلام" },
];

export function ReceptionMethodsToolbar({
  search,
  onSearchSubmit,
  sort,
  onSortChange,
}: ReceptionMethodsToolbarProps) {
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sort.sortBy)?.label ?? "ترتيب";

  const handleSortSelect = (value: string) => {
    if (value === sort.sortBy) {
      onSortChange({
        sortBy: value,
        sortOrder: sort.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ sortBy: value, sortOrder: "asc" });
    }
  };

  return (
    <div className="flex gap-4 flex-col md:flex-row-reverse md:items-center md:justify-between">
      <SearchForm
        defaultValue={search}
        onSubmit={onSearchSubmit}
        placeholder="بحث عن طريقة استلام..."
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 md:gap-2">
            {sort.sortOrder === "asc" ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
            <span>{currentLabel}</span>
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
    </div>
  );
}
