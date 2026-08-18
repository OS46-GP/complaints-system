import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { useDepartments } from "@/features/complaint-list/hooks";

interface DepartmentFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  limit?: number;
}

type ComboItem = { label: string; value: string };

export function DepartmentFilter({
  value,
  onChange,
  className,
  placeholder = "كل الجهات",
  limit = 50,
}: DepartmentFilterProps) {
  const { data: departments, isLoading } = useDepartments();
  const [visibleCount, setVisibleCount] = React.useState(limit);

  const items: ComboItem[] = React.useMemo(
    () => [
      { label: placeholder, value: "" },
      ...(departments ?? []).map((dept) => ({ label: dept.name, value: dept.name })),
    ],
    [departments, placeholder],
  );
  const selected = items.find((i) => i.value === value) ?? items[0];

  const loadMore = React.useCallback(() => {
    setVisibleCount((c) => c + limit);
  }, [limit]);

  const handleListScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
        loadMore();
      }
    },
    [loadMore],
  );

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(item) => onChange(item?.value ?? "")}
      itemToStringValue={(item) => item.label}
      disabled={isLoading}
      limit={visibleCount}
    >
      <ComboboxTrigger
        aria-label={placeholder}
        className={cn(
          "flex w-fit items-center gap-1.5 rounded-md border border-input bg-transparent py-2 pe-2 ps-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-start">
          <ComboboxValue placeholder={placeholder} />
        </span>
      </ComboboxTrigger>
      <ComboboxContent
        align="end"
        positionerClassName="z-[70]"
        className="min-w-(--anchor-width)"
      >
        <ComboboxInput
          showTrigger={false}
          showClear={false}
          placeholder="ابحث عن جهة..."
          className="mx-1 mt-1 w-[calc(100%-8px)]"
        />
        <ComboboxEmpty>لا توجد نتائج</ComboboxEmpty>
        <ComboboxList onScroll={handleListScroll}>
          {(item: ComboItem) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}