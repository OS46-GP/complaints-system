import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

export interface QuickActionItem {
  key: string;
  title: string;
  description?: string;
  url: string;
  icon: LucideIcon;
}

interface QuickActionsProps {
  items: QuickActionItem[];
}

export function QuickActions({ items }: Readonly<QuickActionsProps>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.url}
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface-container-lowest p-5 transition-colors hover:border-primary/40 hover:bg-muted"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <item.icon className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-heading text-label-sm text-foreground">
              {item.title}
            </span>
            {item.description && (
              <span className="truncate text-label-sm text-muted-foreground">
                {item.description}
              </span>
            )}
          </span>
          <ArrowLeft className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}