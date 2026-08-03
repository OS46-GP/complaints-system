import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatusBreakdownProps {
  value: Record<string, number>;
  total: number;
}

const BAR_COLORS = [
  "bg-primary",
  "bg-amber-500",
  "bg-green-600",
  "bg-destructive",
  "bg-secondary",
  "bg-teal-500",
  "bg-purple-500",
];

export function StatusBreakdown({
  value,
  total,
}: Readonly<StatusBreakdownProps>) {
  const entries = Object.entries(value).sort((a, b) => b[1] - a[1]);

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-border bg-surface-container-lowest p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          الشكاوى حسب الحالة
        </h2>
        <span className="inline-flex items-center gap-1.5 text-label-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" />
          {total.toLocaleString("ar-SA")}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-body-md text-muted-foreground">
          لا توجد شكاوى في هذه الفترة
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {entries.map(([status, count], index) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <li key={status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-heading text-label-sm text-foreground">
                    {status}
                  </span>
                  <span className="font-mono text-mono-data text-muted-foreground">
                    {count.toLocaleString("ar-SA")}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      BAR_COLORS[index % BAR_COLORS.length],
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}