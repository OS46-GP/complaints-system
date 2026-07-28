import { Filter, ArrowUpDown, Download, Plus } from "lucide-react";
import { useLocation, Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchForm } from "@/components/shared/search-form";
import { DataTableToolbar } from "@/components/shared/data-table";
import { PATHS } from "@/router/paths";

interface ComplaintToolbarProps {
  search: string;
  onSearchSubmit: (value: string) => void;
  start: number;
  end: number;
  totalCount: number;
}

export function ComplaintToolbar({
  search,
  onSearchSubmit,
  start,
  end,
  totalCount,
}: ComplaintToolbarProps) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const newComplaintPath = isAdmin
    ? PATHS.ADMIN.NEW_COMPLAINT
    : PATHS.USER.NEW_COMPLAINT;

  return (
    <DataTableToolbar className="flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <SearchForm
          defaultValue={search}
          onSubmit={onSearchSubmit}
          inputClassName="w-48"
        />
        <Button variant="outline" size="sm" className="gap-1 md:gap-2">
          <Filter className="size-4" />
          <span className="hidden sm:inline">تصفية</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 md:gap-2">
          <ArrowUpDown className="size-4" />
          <span className="hidden sm:inline">ترتيب</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1 md:gap-2">
          <Download className="size-4" />
          <span className="hidden sm:inline">تصدير</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button asChild size="sm">
          <Link to={newComplaintPath} className="gap-1 md:gap-2">
            <Plus className="size-4" />
            <span>جديد</span>
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Separator orientation="vertical" className="hidden sm:block h-6" />
        <p className="font-heading text-body-lg text-muted-foreground whitespace-nowrap">
          {start.toLocaleString("ar-SA")}–{end.toLocaleString("ar-SA")}
          <span className="hidden sm:inline">
            {" "}
            من أصل {totalCount.toLocaleString("ar-SA")}
          </span>
        </p>
      </div>
    </DataTableToolbar>
  );
}
