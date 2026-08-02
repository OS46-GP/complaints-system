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
import { ComplaintTypesToolbar } from "@/features/complaint-types/complaint-types-toolbar";
import { ComplaintTypeCard } from "@/features/complaint-types/complaint-type-card";
import { ComplaintTypeActionsDropdown } from "@/features/complaint-types/complaint-type-actions-dropdown";
import { EmptyState } from "@/features/complaint-types/empty-state";
import type { ComplaintType } from "@/features/complaint-types/types";

interface ComplaintTypesListProps {
  types: ComplaintType[];
  onEdit: (type: ComplaintType) => void;
}

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const PAGE_SIZE = 10;

const columns: DataTableColumn[] = [
  { key: "id", label: "الرقم" },
  { key: "name", label: "اسم الفئة" },
  { key: "actions", label: "الإجراءات", className: "text-center" },
];

export function ComplaintTypesList({ types, onEdit }: ComplaintTypesListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? "";
  const sort: SortState = {
    sortBy: searchParams.get("sortBy") || "id",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  };

  const totalPages = Math.max(1, Math.ceil(types.length / PAGE_SIZE));
  const totalCount = types.length;

  const paginatedTypes = types.slice(
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
  const isEmpty = types.length === 0;

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="flex flex-col gap-4">
      <ComplaintTypesToolbar
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
            {paginatedTypes.map((type) => (
              <ComplaintTypeCard
                key={type.id}
                type={type}
                onEdit={() => onEdit(type)}
              />
            ))}
          </div>

          <DataTable className="hidden lg:block">
            <DataTableHeader columns={columns} />
            <DataTableBody>
              {paginatedTypes.map((type) => (
                <ComplaintTypeRow
                  key={type.id}
                  type={type}
                  onEdit={() => onEdit(type)}
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
            entity="فئة"
          />
        </div>
      )}
    </div>
  );
}

interface ComplaintTypeRowProps {
  type: ComplaintType;
  onEdit: () => void;
}

function ComplaintTypeRow({ type, onEdit }: ComplaintTypeRowProps) {
  return (
    <DataTableRow className="hover:bg-surface-container-low transition-colors group">
      <DataTableCell className="p-0 px-6 py-4 font-mono text-mono-data text-muted-foreground">
        {type.id}
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4">
        <p className="font-heading text-body-lg font-bold text-foreground">
          {type.name}
        </p>
      </DataTableCell>
      <DataTableCell className="p-0 px-6 py-4 text-center">
        <ComplaintTypeActionsDropdown
          typeId={type.id}
          typeName={type.name}
          onEdit={onEdit}
        />
      </DataTableCell>
    </DataTableRow>
  );
}
