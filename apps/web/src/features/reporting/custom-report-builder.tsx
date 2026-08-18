import { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, FileText, CheckSquare } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportResultTable } from "@/features/reporting/components/report-result-table";
import { ExportButtons } from "@/features/reporting/components/export-buttons";
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { DateRangePicker, type DateRangeValue } from "@/features/reporting/components/date-range-picker";
import { DepartmentFilter } from "@/features/reporting/components/department-filter";
import { VillageFilter } from "@/features/reporting/components/village-filter";
import { useCustomReport, useExportCustomReport } from "@/features/reporting/hooks";
import { openDownload } from "@/features/reporting/download";
import { useExaminationStatuses } from "@/features/complaint-list/hooks";
import type { DataTableColumn } from "@/components/shared/data-table";
import type {
  CustomReportFilters,
  CustomReportResult,
  ExportFormat,
} from "@/features/reporting/types";

const columns: DataTableColumn[] = [
  { key: "number", label: "رقم الشكوى", className: "text-center" },
  { key: "citizen", label: "المواطن" },
  { key: "village", label: "القرية / المركز" },
  { key: "department", label: "الجهة" },
  { key: "status", label: "حالة الفحص" },
  { key: "arrival", label: "تاريخ الوصول" },
];

interface CustomReportBuilderProps {
  basePath: string;
}

export function CustomReportBuilder({ basePath }: CustomReportBuilderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    return from && to ? { from, to } : {};
  });
  const [village, setVillage] = useState(searchParams.get("village") ?? "");
  const [department, setDepartment] = useState(
    searchParams.get("department") ?? "",
  );
  const [examinationStatus, setExaminationStatus] = useState(
    searchParams.get("examinationStatus") ?? "",
  );
  const [result, setResult] = useState<CustomReportResult | null>(null);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const customMutation = useCustomReport();
  const exportMutation = useExportCustomReport();
  const { data: statuses, isLoading: statusesLoading } = useExaminationStatuses();

  const buildFilters = (): CustomReportFilters => ({
    dateRange:
      dateRange.from && dateRange.to
        ? { from: dateRange.from, to: dateRange.to }
        : undefined,
    village: village || undefined,
    department: department || undefined,
    examinationStatus: examinationStatus || undefined,
  });

  const syncUrl = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(buildFilters())) {
          if (value === undefined || value === "") {
            next.delete(key);
          } else if (key === "dateRange") {
            const range = value as { from: string; to: string };
            next.set("from", range.from);
            next.set("to", range.to);
          } else {
            next.set(key, String(value));
          }
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleGenerate = () => {
    syncUrl();
    customMutation.mutate(buildFilters(), {
      onSuccess: (data) => setResult(data),
    });
  };

  const handleExport = (format: ExportFormat) => {
    if (!result) return;
    setExportingFormat(format);
    exportMutation.mutate(
      { ...buildFilters(), format },
      {
        onSuccess: (res) => {
          setExportingFormat(null);
          openDownload(res);
        },
        onError: () => {
          setExportingFormat(null);
        },
      },
    );
  };

  const hasFilters = !!(dateRange.from || dateRange.to || village || department || examinationStatus);

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="تقرير مخصص"
        description="تصفية الشكاوى حسب أي مجموعة من المعايير وعرض النتائج مع ملخص"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            معايير التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="font-heading text-label-sm text-muted-foreground">
                النطاق الزمني
              </Label>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 font-heading text-label-sm text-muted-foreground">
                القرية / المركز
              </Label>
              <VillageFilter
                value={village}
                onChange={setVillage}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 font-heading text-label-sm text-muted-foreground">
                الجهة
              </Label>
              <DepartmentFilter
                value={department}
                onChange={setDepartment}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 font-heading text-label-sm text-muted-foreground">
                <CheckSquare className="size-4" />
                حالة الفحص
              </Label>
              <Select
                value={examinationStatus || undefined}
                onValueChange={(v) => setExaminationStatus(v === "all" ? "" : v)}
                disabled={statusesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  {(statuses ?? []).map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              className="gap-2"
              onClick={handleGenerate}
              disabled={customMutation.isPending}
            >
              <Search className="size-4" />
              {customMutation.isPending ? "جارٍ التوليد..." : "توليد التقرير"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-surface-container-lowest p-4">
                  <p className="font-heading text-label-sm text-muted-foreground">
                    إجمالي الشكاوى
                  </p>
                  <p className="mt-1 font-heading text-display-lg text-foreground">
                    {result.summary.total.toLocaleString("ar-SA")}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface-container-lowest p-4">
                  <p className="font-heading text-label-sm text-muted-foreground">
                    حسب حالة الفحص
                  </p>
                  <ul className="mt-2 space-y-1 text-label-sm">
                    {Object.entries(result.summary.byStatus).map(([key, count]) => (
                      <li key={key} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-mono text-mono-data">
                          {count.toLocaleString("ar-SA")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-surface-container-lowest p-4">
                  <p className="font-heading text-label-sm text-muted-foreground">
                    حسب الجهة
                  </p>
                  <ul className="mt-2 space-y-1 text-label-sm">
                    {Object.entries(result.summary.byDepartment).map(([key, count]) => (
                      <li key={key} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-mono text-mono-data">
                          {count.toLocaleString("ar-SA")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-title-sm md:text-title-md text-foreground">
              الشكاوى المطابقة
            </h2>
            <ExportButtons
              onExport={handleExport}
              isExporting={exportingFormat}
              disabled={!result}
              disabledHint="ولّد التقرير أولًا ثم صدّره"
            />
          </div>

          <ReportResultTable
            columns={columns}
            emptyText="لا توجد شكاوى مطابقة للمعايير المحددة"
          >
            {result.complaints.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-b-0">
                <td className="px-6 py-3.5 text-center">
                  <span
                    dir="ltr"
                    className="font-mono text-mono-data text-foreground"
                  >
                    #{c.complaintNumber}-{c.statementYear}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-heading text-label-sm text-foreground">
                  {c.citizenName}
                </td>
                <td className="px-6 py-3.5 text-label-sm text-muted-foreground">
                  {c.citizenVillage ?? "-"}
                </td>
                <td className="px-6 py-3.5 text-label-sm text-muted-foreground">
                  {c.department ?? "-"}
                </td>
                <td className="px-6 py-3.5 text-label-sm text-muted-foreground">
                  {c.examinationStatus ?? "-"}
                </td>
                <td className="px-6 py-3.5 text-label-sm text-muted-foreground">
                  {new Date(c.arrivalDate).toLocaleDateString("ar-SA")}
                </td>
              </tr>
            ))}
          </ReportResultTable>
        </>
      )}

      {!result && !hasFilters && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <FileText className="size-10 text-muted-foreground/40" />
          <p className="font-heading text-body-lg font-semibold text-foreground">
            اختر معايير التقرير ثم اضغط «توليد التقرير»
          </p>
          <p className="text-body-sm text-muted-foreground">
            يمكنك التصفية حسب النطاق الزمني والقرية والجهة وحالة الفحص
          </p>
        </div>
      )}

      {hasFilters && !result && (
        <p className="text-center text-label-sm text-muted-foreground">
          اضغط «توليد التقرير» لعرض النتائج
        </p>
      )}
    </div>
  );
}
