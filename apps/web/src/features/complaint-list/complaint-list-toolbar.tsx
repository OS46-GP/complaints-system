import { useState, useEffect } from "react";
import { Filter, ArrowUpDown, Download, Plus, Search } from "lucide-react";
import { useLocation, Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit(inputValue);
    }
  };

  return (
    <DataTableToolbar className="flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            dir="auto"
            className="h-9 w-48 pe-9 ps-3 bg-surface-container-lowest border border-input rounded-lg text-body-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-all"
            placeholder="بحث..."
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
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
        <p className="font-heading text-label-sm text-muted-foreground whitespace-nowrap">
          {start.toLocaleString("ar-SA")}–{end.toLocaleString("ar-SA")}
          <span className="hidden sm:inline"> من أصل {totalCount.toLocaleString("ar-SA")}</span>
        </p>
      </div>
    </DataTableToolbar>
  );
}
