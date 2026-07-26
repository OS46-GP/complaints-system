import { Filter, ArrowUpDown, Download, Plus } from "lucide-react";
import { useLocation, Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTableToolbar } from "@/components/data-table";
import { PATHS } from "@/router/paths";

interface ComplaintTableToolbarProps {
  start: number;
  end: number;
  totalCount: number;
}

export function ComplaintTableToolbar({
  start,
  end,
  totalCount,
}: ComplaintTableToolbarProps) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const newComplaintPath = isAdmin
    ? `${PATHS.ADMIN.COMPLAINTS}/new`
    : PATHS.USER.NEW_COMPLAINT;

  return (
    <DataTableToolbar>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2">
          <Filter className="size-4" />
          <span>تصفية</span>
        </Button>
        <Button variant="outline" className="gap-2">
          <ArrowUpDown className="size-4" />
          <span>ترتيب</span>
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          <span>تصدير</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button asChild>
          <Link to={newComplaintPath} className="gap-2">
            <Plus className="size-4" />
            <span>شكوى جديدة</span>
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Separator orientation="vertical" className="h-6" />
        <p className="font-heading text-label-sm text-muted-foreground">
          عرض {start.toLocaleString("ar-SA")}-{end.toLocaleString("ar-SA")} من
          أصل {totalCount.toLocaleString("ar-SA")}
        </p>
      </div>
    </DataTableToolbar>
  );
}
