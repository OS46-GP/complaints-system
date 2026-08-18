import { CheckCircle2 } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const PALETTE = [
  { fill: "var(--primary)", swatch: "bg-primary" },
  { fill: "#f59e0b", swatch: "bg-amber-500" },
  { fill: "#16a34a", swatch: "bg-green-600" },
  { fill: "var(--destructive)", swatch: "bg-destructive" },
  { fill: "var(--secondary)", swatch: "bg-secondary" },
  { fill: "#14b8a6", swatch: "bg-teal-500" },
  { fill: "#a855f7", swatch: "bg-purple-500" },
];

const chartConfig: ChartConfig = {
  count: {
    label: "عدد الشكاوى",
  },
};

function toArabic(value: number): string {
  return value.toLocaleString("ar-SA");
}

interface StatusDonutCardProps {
  byStatus: Record<string, number>;
  total: number;
}

export function StatusDonutCard({ byStatus, total }: StatusDonutCardProps) {
  const entries = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);
  const data = entries.map(([status, count]) => ({ status, count }));
  const hasData = data.length > 0;

  return (
    <section className="flex h-full flex-col gap-6 rounded-xl border border-border bg-surface-container-lowest p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          توزيع الشكاوى حسب الحالة
        </h2>
        <span className="inline-flex items-center gap-1.5 text-label-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-primary" />
          {toArabic(total)} شكوى
        </span>
      </div>

      {!hasData ? (
        <p className="text-body-md text-muted-foreground">
          لا توجد شكاوى في هذه الفترة
        </p>
      ) : (
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <div className="relative w-full max-w-56">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => toArabic(Number(value))}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="68%"
                  outerRadius="92%"
                  paddingAngle={2}
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={
                        PALETTE[data.indexOf(entry) % PALETTE.length].fill
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-display-lg text-foreground">
                {toArabic(total)}
              </span>
              <span className="font-heading text-label-sm text-muted-foreground">
                شكوى
              </span>
            </div>
          </div>

          <ul className="flex w-full flex-col gap-3">
            {entries.map(([label, count], i) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "size-3 shrink-0 rounded-full",
                      PALETTE[i % PALETTE.length].swatch,
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate font-heading text-label-sm text-foreground">
                    {label}
                  </span>
                  <span className="font-mono text-mono-data text-muted-foreground">
                    {toArabic(count)}
                  </span>
                  <span className="w-12 text-end font-mono text-mono-data text-foreground">
                    {toArabic(pct)}٪
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}