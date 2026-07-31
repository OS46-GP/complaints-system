import { useState, useMemo, useRef, useEffect } from "react";
import { Filter, RotateCcw, Search, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  useDepartments,
  useComplaintTypes,
  useExaminationStatuses,
  useReceptionMethods,
  usePresentationStatuses,
} from "@/features/complaint-list/hooks";

export interface FilterValues {
  departmentId: string;
  severity: string;
  complaintTypeId: string;
  examinationStatusId: string;
  receptionMethodId: string;
  presentationStatusId: string;
  complaintNumber: string;
  statementYear: string;
}

interface ComplaintFilterSheetProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  onClear: () => void;
}

type ComboItem = { label: string; value: string };

const SEVERITY_ITEMS: ComboItem[] = [
  { label: "الكل", value: "" },
  { label: "عاجل", value: "High" },
  { label: "متوسط", value: "Medium" },
  { label: "عادي", value: "Low" },
];

const EMPTY_FILTERS: FilterValues = {
  departmentId: "",
  severity: "",
  complaintTypeId: "",
  examinationStatusId: "",
  receptionMethodId: "",
  presentationStatusId: "",
  complaintNumber: "",
  statementYear: "",
};

function toComboItems<T extends { id: number | string; name: string }>(
  data: T[] | undefined,
): ComboItem[] {
  return [
    { label: "الكل", value: "" },
    ...(data?.map((d) => ({ label: d.name, value: String(d.id) })) ?? []),
  ];
}

function FilterPanel({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          aria-hidden="true"
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-popover text-sm text-popover-foreground shadow-lg transition-transform duration-200 sm:max-w-md data-[side=right]:border-s ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-side="right"
      >
        {children}
      </div>
    </>
  );
}

function FilterPanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 p-4" data-slot="sheet-header">
      {children}
    </div>
  );
}

function FilterPanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-auto flex flex-col gap-2 p-4"
      data-slot="sheet-footer"
    >
      {children}
    </div>
  );
}

export function ComplaintFilterSheet({
  filters,
  onFiltersChange,
  onClear,
}: ComplaintFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(filters);

  const { data: departments } = useDepartments();
  const { data: complaintTypes } = useComplaintTypes();
  const { data: examinationStatuses } = useExaminationStatuses();
  const { data: receptionMethods } = useReceptionMethods();
  const { data: presentationStatuses } = usePresentationStatuses();

  const departmentItems = useMemo(
    () => toComboItems(departments),
    [departments],
  );
  const complaintTypeItems = useMemo(
    () => toComboItems(complaintTypes),
    [complaintTypes],
  );
  const examinationStatusItems = useMemo(
    () => toComboItems(examinationStatuses),
    [examinationStatuses],
  );
  const receptionMethodItems = useMemo(
    () => toComboItems(receptionMethods),
    [receptionMethods],
  );
  const presentationStatusItems = useMemo(
    () => toComboItems(presentationStatuses),
    [presentationStatuses],
  );

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const apply = () => {
    onFiltersChange(draft);
    setOpen(false);
  };

  const reset = () => {
    setDraft(EMPTY_FILTERS);
    onClear();
    setOpen(false);
  };

  function renderCombobox(
    items: ComboItem[],
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
  ) {
    const selected = items.find((i) => i.value === value) ?? null;

    return (
      <Combobox
        items={items}
        value={selected}
        onValueChange={(item) => onChange(item?.value ?? "")}
        itemToStringValue={(item) => item.label}
      >
        <ComboboxInput placeholder={placeholder ?? "اختر..."} showClear />
        <ComboboxContent
          align="end"
          positionerClassName="z-[70]"
        >
          <ComboboxEmpty>لا توجد نتائج</ComboboxEmpty>
          <ComboboxList>
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 md:gap-2"
        onClick={() => {
          setDraft(filters);
          setOpen(true);
        }}
      >
        <Filter className="size-4" />
        <span className="hidden sm:inline">تصفية</span>
        {hasActiveFilters && (
          <span className="size-2 rounded-full bg-primary" />
        )}
      </Button>

      <FilterPanel open={open} onClose={() => setOpen(false)}>
        <FilterPanelHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-medium text-foreground">
                تصفية الشكاوى
              </h2>
              <p className="text-sm text-muted-foreground">
                اختر المعايير لتصفية قائمة الشكاوى
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </FilterPanelHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
          className="flex flex-col flex-1"
        >
          <div className="flex-1 overflow-y-auto space-y-5 px-4 py-6">
            <div className="flex flex-col gap-2">
              <Label>الجهة المعنية</Label>
              {renderCombobox(
                departmentItems,
                draft.departmentId,
                (v) => setDraft({ ...draft, departmentId: v }),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>الأولوية</Label>
              {renderCombobox(
                SEVERITY_ITEMS,
                draft.severity,
                (v) => setDraft({ ...draft, severity: v }),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>الفئة</Label>
              {renderCombobox(
                complaintTypeItems,
                draft.complaintTypeId,
                (v) => setDraft({ ...draft, complaintTypeId: v }),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>حالة الفحص</Label>
              {renderCombobox(
                examinationStatusItems,
                draft.examinationStatusId,
                (v) => setDraft({ ...draft, examinationStatusId: v }),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>طريقة الاستلام</Label>
              {renderCombobox(
                receptionMethodItems,
                draft.receptionMethodId,
                (v) => setDraft({ ...draft, receptionMethodId: v }),
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>حالة التقديم</Label>
              {renderCombobox(
                presentationStatusItems,
                draft.presentationStatusId,
                (v) => setDraft({ ...draft, presentationStatusId: v }),
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>رقم الشكوى</Label>
                <Input
                  type="number"
                  min="1"
                  value={draft.complaintNumber}
                  onChange={(e) =>
                    setDraft({ ...draft, complaintNumber: e.target.value })
                  }
                  placeholder="الكل"
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>السنة</Label>
                <Input
                  type="number"
                  min="2000"
                  value={draft.statementYear}
                  onChange={(e) =>
                    setDraft({ ...draft, statementYear: e.target.value })
                  }
                  placeholder="الكل"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <FilterPanelFooter>
            <div className="flex flex-row gap-2 border-t px-0 pt-4">
              <Button type="submit" className="gap-2 flex-1">
                <Search className="size-4" />
                تطبيق
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={reset}
                disabled={!hasActiveFilters}
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                إعادة تعيين
              </Button>
            </div>
          </FilterPanelFooter>
        </form>
      </FilterPanel>
    </>
  );
}
