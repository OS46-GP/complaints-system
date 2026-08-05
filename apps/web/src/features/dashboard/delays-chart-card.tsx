import { AlarmClock, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DelayReport } from "@/features/reporting/types";

const chartConfig: ChartConfig = {
  overdueCount: {
    label: "الشكاوى المتأخرة",
    color: "var(--destructive)",
  },
};

function toArabic(value: number): string {
  return value.toLocaleString("ar-SA");
}

const MAX_BARS = 10;

interface DelaysChartCardProps {
  report: DelayReport;
  detailsUrl?: string;
}

export function DelaysChartCard({ report, detailsUrl }: DelaysChartCardProps) {
  const { departments } = report;
  const data = [...departments]
    .sort((a, b) => b.overdueCount - a.overdueCount)
    .slice(0, MAX_BARS)
    .map((d) => ({
      department: d.department,
      overdueCount: d.overdueCount,
    }));

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface-container-lowest p-6">
      <div>
        <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
          المتأخرات حسب الجهة
        </h2>
      </div>

      {data.length === 0 ? (
        <p className="text-body-md text-muted-foreground">
          لا توجد شكاوى متأخرة
        </p>
      ) : (
        <>
          <div className="-mx-1 overflow-x-auto px-1">
            <ChartContainer
              config={chartConfig}
              className="h-120 w-full min-w-[600px]"
            >
              <BarChart
                data={data}
                margin={{ top: 24, right: 16, bottom: 8, left: 4 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 5"
                  stroke="var(--muted)"
                />
                <XAxis
                  dataKey="department"
                  angle={-70}
                  textAnchor="start"
                  height={160}
                  tickMargin={22}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={34}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value: number) => toArabic(Number(value))}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => toArabic(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="overdueCount"
                  radius={[6, 6, 0, 0]}
                  fill="var(--color-overdueCount)"
                  maxBarSize={44}
                >
                  <LabelList
                    dataKey="overdueCount"
                    position="top"
                    formatter={(value) => toArabic(Number(value))}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fill: "var(--foreground)",
                    }}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-label-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <AlarmClock className="size-4 text-destructive" />
              إجمالي المتأخر: {report.totalOverdue.toLocaleString("ar-SA")}
            </span>
            <span>
              عتبة التأخير:{" "}
              {report.overdueThresholdDays.toLocaleString("ar-SA")} يوم
            </span>
          </div>
        </>
      )}

      {detailsUrl && (
        <div className="flex justify-end border-t border-border pt-4">
          <Link
            to={detailsUrl}
            className="inline-flex items-center gap-1.5 text-label-sm text-primary hover:underline"
          >
            عرض كل المتأخرات حسب الجهة
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
