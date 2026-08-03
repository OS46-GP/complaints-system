import { useState } from "react";
import { Search, FileText, Building2, MapPin, CheckSquare } from "lucide-react";

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
import { useCustomReport } from "@/features/reporting/hooks";
import {
  useDepartments,
  useExaminationStatuses,
  useLocations,
} from "@/features/complaint-list/hooks";
import type { DataTableColumn } from "@/components/shared/data-table";
import type { CustomReportResult } from "@/features/reporting/types";

const columns: DataTableColumn[] = [
  { key: "number", label: "رقم الشكوى", className: "text-center" },
  { key: "citizen", label: "المواطن" },
  { key: "village", label: "القرية / المركز" },
  { key: "department", label: "الجهة" },
  { key: "status", label: "حالة الفحص" },
  { key: "arrival", label: "تاريخ الوصول" },
];

function uniqueNames(items: Array<{ name: string }>): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of items) {
    if (item.name && !seen.has(item.name)) {
      seen.add(item.name);
      names.push(item.name);
    }
  }
  return names;
}

interface CustomReportBuilderProps {
  basePath: string;
}

export function CustomReportBuilder({ basePath }: CustomReportBuilderProps) {
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [village, setVillage] = useState("");
  const [department, setDepartment] = useState("");
  const [examinationStatus, setExaminationStatus] = useState("");
  const [result, setResult] = useState<CustomReportResult | null>(null);

  const customMutation = useCustomReport();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { data: statuses, isLoading: statusesLoading } = useExaminationStatuses();
  const { data: locations, isLoading: locationsLoading } = useLocations();

  const villages = uniqueNames(locations ?? []);

  const handleGenerate = () => {
    customMutation.mutate(
      {
        dateRange:
          dateRange.from && dateRange.to
            ? { from: dateRange.from, to: dateRange.to }
            : undefined,
        village: village || undefined,
        department: department || undefined,
        examinationStatus: examinationStatus || undefined,
      },
      {
        onSuccess: (data) => setResult(data),
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
                <MapPin className="size-4" />
                القرية / المركز
              </Label>
              <Select
                value={village || undefined}
                onValueChange={(v) => setVillage(v === "all" ? "" : v)}
                disabled={locationsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="كل القرى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل القرى</SelectItem>
                  {villages.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 font-heading text-label-sm text-muted-foreground">
                <Building2 className="size-4" />
                الجهة
              </Label>
              <Select
                value={department || undefined}
                onValueChange={(v) => setDepartment(v === "all" ? "" : v)}
                disabled={departmentsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="كل الجهات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الجهات</SelectItem>
                  {(departments ?? []).map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled
              disabledHint="تصدير التقارير المخصصة غير مدعوم مباشرة — يمكن توليد تقرير إنجاز أو متأخرات وتصديره من شاشة التوليد عند الطلب"
              onExport={() => {}}
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
