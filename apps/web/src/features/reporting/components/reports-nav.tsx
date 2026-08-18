import { Link, useLocation } from "react-router";
import {
  BarChart3,
  FileText,
  History,
  ListChecks,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface ReportsNavItem {
  key: string;
  title: string;
  url: string;
  icon: typeof BarChart3;
}

interface ReportsNavProps {
  basePath: string;
}

function buildItems(basePath: string): ReportsNavItem[] {
  return [
    {
      key: "dashboard",
      title: "التقارير",
      url: basePath,
      icon: BarChart3,
    },
    {
      key: "custom",
      title: "تقرير مخصص",
      url: `${basePath}/custom`,
      icon: ListChecks,
    },
    {
      key: "scheduled",
      title: "التقارير المجدولة",
      url: `${basePath}/scheduled`,
      icon: History,
    },
    {
      key: "on-demand",
      title: "توليد عند الطلب",
      url: `${basePath}/on-demand`,
      icon: Zap,
    },
    {
      key: "memo",
      title: "الخطابات والمذكرات",
      url: `${basePath}/memo`,
      icon: FileText,
    },
  ];
}

export function ReportsNav({ basePath }: ReportsNavProps) {
  const location = useLocation();
  const items = buildItems(basePath);

  return (
    <nav className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface-container-lowest p-1.5">
      {items.map((item) => {
        const isActive =
          item.key === "dashboard"
            ? location.pathname === item.url
            : location.pathname.startsWith(item.url);
        return (
          <Link
            key={item.key}
            to={item.url}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              isActive &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
