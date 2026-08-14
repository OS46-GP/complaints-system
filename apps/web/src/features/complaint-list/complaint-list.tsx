import { useState } from "react";
import { useSearchParams } from "react-router";
import { FileText, Sparkles, X } from "lucide-react";
import { ListPagination } from "@/components/shared/list-pagination";
import { Reveal } from "@/components/shared/reveal";
import { ComplaintCard } from "@/features/complaint-list/complaint-card";
import { ComplaintTableRow } from "@/features/complaint-list/complaint-table-row";
import { ComplaintToolbar } from "@/features/complaint-list/complaint-list-toolbar";
import { EmptyState } from "@/features/complaint-list/empty-state";
import { BatchAiDialog } from "@/features/complaint-list/batch-ai-dialog";
import type { FilterValues } from "@/features/complaint-list/complaint-filter-sheet";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/features/settings/preferences/store";
import type { ComplaintItem } from "@/features/complaint-list/types";

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface ComplaintListProps {
  complaints: ComplaintItem[];
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const BASE_COLUMNS: DataTableColumn[] = [
  { key: "id", label: "رقم الشكوى", className: "w-28" },
  { key: "subject", label: "الموضوع", className: "w-64" },
  { key: "citizen", label: "المواطن", className: "w-40" },
  { key: "department", label: "القسم", className: "w-40" },
  { key: "severityStatus", label: "الأولوية / الحالة", className: "w-36" },
  { key: "createdAt", label: "تاريخ الإنشاء", className: "w-36" },
  { key: "actions", label: "الإجراءات", className: "w-20 text-center" },
];

function filtersFromParams(params: URLSearchParams): FilterValues {
  return {
    departmentId: params.get("departmentId") ?? "",
    severity: params.get("severity") ?? "",
    complaintTypeId: params.get("complaintTypeId") ?? "",
    examinationStatusId: params.get("examinationStatusId") ?? "",
    receptionMethodId: params.get("receptionMethodId") ?? "",
    complaintNumber: params.get("complaintNumber") ?? "",
    statementYear: params.get("statementYear") ?? "",
  };
}

function sortFromParams(params: URLSearchParams, fallback: SortState): SortState {
  const sortBy = params.get("sortBy") || fallback.sortBy;
  const sortOrder = (params.get("sortOrder") as "asc" | "desc") || fallback.sortOrder;
  return { sortBy, sortOrder };
}

export function ComplaintList({
  complaints,
  totalPages,
  totalCount,
  pageSize,
}: ComplaintListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { preferences } = usePreferences();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const filters = filtersFromParams(searchParams);
  const quickDueToday = (searchParams.get("dueToday") ?? "") === "true";
  const quickOverdue = (searchParams.get("overdueUnresponded") ?? "") === "true";
  const sort = sortFromParams(searchParams, {
    sortBy: preferences.complaints.sortBy,
    sortOrder: preferences.complaints.sortOrder,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [aiMode, setAiMode] = useState<"summary" | "report">("summary");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("search", value);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setSearchParams((prev) => {
      for (const [key, value] of Object.entries(newFilters)) {
        if (value) prev.set(key, value);
        else prev.delete(key);
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const handleSortChange = (newSort: SortState) => {
    setSearchParams((prev) => {
      prev.set("sortBy", newSort.sortBy);
      prev.set("sortOrder", newSort.sortOrder);
      prev.set("page", "1");
      return prev;
    });
  };

  const toggleQuickFilter = (key: "dueToday" | "overdueUnresponded") => {
    setSearchParams((prev) => {
      if (prev.get(key) === "true") prev.delete(key);
      else prev.set(key, "true");
      prev.set("page", "1");
      return prev;
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters =
    !!search || Object.values(filters).some((v) => v !== "") || quickDueToday || quickOverdue;
  const isEmpty = complaints.length === 0;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  const pageIds = complaints.map((c) => c.id);
  const pageSelectedCount = pageIds.filter((id) => selectedIds.has(id)).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openAiDialog = (mode: "summary" | "report") => {
    setAiMode(mode);
    setAiDialogOpen(true);
  };

  const columns: DataTableColumn[] = [
    {
      key: "select",
      label: (
        <Checkbox
          aria-label="تحديد كل الشكاوى في الصفحة"
          checked={
            pageIds.length > 0 && pageSelectedCount === pageIds.length
              ? true
              : pageSelectedCount > 0
                ? "indeterminate"
                : false
          }
          onCheckedChange={(checked) => toggleSelectAll(checked === true)}
        />
      ),
      className: "w-10",
    },
    ...BASE_COLUMNS,
  ];

  return (
    <div className="flex flex-col gap-4">
      <ComplaintToolbar
        search={search}
        onSearchSubmit={handleSearchChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onFiltersClear={clearFilters}
        sort={sort}
        onSortChange={handleSortChange}
        quickDueToday={quickDueToday}
        quickOverdue={quickOverdue}
        onToggleQuickFilter={toggleQuickFilter}
        start={start}
        end={end}
        totalCount={totalCount}
      />

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="font-heading text-label-sm font-semibold text-foreground">
            تم تحديد {selectedIds.size.toLocaleString("ar-SA")} شكوى
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => openAiDialog("summary")}>
              <Sparkles className="size-4" />
              ملخص جماعي
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAiDialog("report")}
            >
              <FileText className="size-4" />
              تقرير
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <X className="size-4" />
              إلغاء التحديد
            </Button>
          </div>
        </div>
      )}

      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="md:hidden grid grid-cols-1 gap-4">
            {complaints.map((complaint, index) => (
              <Reveal key={complaint.id} delay={index * 40}>
                <ComplaintCard
                  complaint={complaint}
                  selected={selectedIds.has(complaint.id)}
                  onToggle={() => toggleSelect(complaint.id)}
                />
              </Reveal>
            ))}
          </div>

          <DataTable
            className="hidden md:block w-full overflow-x-auto"
            tableClassName="table-fixed"
          >
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {complaints.map((complaint) => (
                <ComplaintTableRow
                  key={complaint.id}
                  complaint={complaint}
                  selected={selectedIds.has(complaint.id)}
                  onToggle={() => toggleSelect(complaint.id)}
                />
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}

      {!isEmpty && totalPages > 1 && (
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="w-full"
          />
        </div>
      )}

      <BatchAiDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        complaintIds={Array.from(selectedIds)}
        count={selectedIds.size}
        initialMode={aiMode}
      />
    </div>
  );
}