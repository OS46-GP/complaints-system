import { useSearchParams } from "react-router";
import { ListPagination } from "@/components/shared/list-pagination";
import { PaginationInfo } from "@/components/shared/pagination-info";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { ReceptionMethodsToolbar } from "@/features/reception-methods/reception-methods-toolbar";
import { ReceptionMethodCard } from "@/features/reception-methods/reception-method-card";
import { ReceptionMethodActionsDropdown } from "@/features/reception-methods/reception-method-actions-dropdown";
import { EmptyState } from "@/features/reception-methods/empty-state";
import type { ReceptionMethod } from "@/features/reception-methods/types";

interface ReceptionMethodsListProps {
  methods: ReceptionMethod[];
  onEdit: (method: ReceptionMethod) => void;
}

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const PAGE_SIZE = 10;

const columns: DataTableColumn[] = [
  { key: "id", label: "الرقم" },
  { key: "name", label: "اسم طريقة الاستلام" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function ReceptionMethodsList({ methods, onEdit }: ReceptionMethodsListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const sort: SortState = {
    sortBy: searchParams.get("sortBy") || "id",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  };

  const totalPages = Math.max(1, Math.ceil(methods.length / PAGE_SIZE));
  const totalCount = methods.length;

  const paginatedMethods = methods.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      prev.set(key, value);
      return prev;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set("search", value);
      } else {
        prev.delete("search");
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

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = !!search;
  const isEmpty = methods.length === 0;

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <ReceptionMethodsToolbar
        search={search}
        onSearchSubmit={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {isEmpty ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {paginatedMethods.map((method) => (
              <ReceptionMethodCard
                key={method.id}
                method={method}
                onEdit={() => onEdit(method)}
              />
            ))}
          </div>

          <DataTable className="hidden lg:block">
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {paginatedMethods.map((method) => (
                <ReceptionMethodRow
                  key={method.id}
                  method={method}
                  onEdit={() => onEdit(method)}
                />
              ))}
            </DataTableBody>
          </DataTable>
        </>
      )}

      {!isEmpty && totalPages > 1 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4 border border-border rounded-xl bg-surface-container-lowest">
          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setParam("page", String(page))}
            showGoto={false}
          />
          <PaginationInfo
            start={start}
            end={end}
            totalCount={totalCount}
            entity="طريقة استلام"
          />
        </div>
      )}
    </div>
  );
}

interface ReceptionMethodRowProps {
  method: ReceptionMethod;
  onEdit: () => void;
}

function ReceptionMethodRow({ method, onEdit }: ReceptionMethodRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {method.id}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <p className="font-heading text-body-lg font-bold text-foreground">
          {method.name}
        </p>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <ReceptionMethodActionsDropdown
          methodId={method.id}
          methodName={method.name}
          onEdit={onEdit}
        />
      </DataTableCell>
    </DataTableRow>
  );
}
