import { useState } from "react";
import { Zap } from "lucide-react";

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
import { ReportsNav } from "@/features/reporting/components/reports-nav";
import { GeneratedReportView } from "@/features/reporting/components/generated-report-view";
import { DateRangePicker, type DateRangeValue } from "@/features/reporting/components/date-range-picker";
import { useGenerateReport } from "@/features/reporting/hooks";
import { getReportTypeLabel, type ReportType } from "@/features/reporting/types";

interface OnDemandReportProps {
  basePath: string;
}

export function OnDemandReport({ basePath }: OnDemandReportProps) {
  const [type, setType] = useState<ReportType>("ACHIEVEMENT");
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const generateMutation = useGenerateReport();
  const generated = generateMutation.data;

  const handleGenerate = () => {
    if (!dateRange.from || !dateRange.to) return;
    generateMutation.mutate({
      type,
      from: dateRange.from,
      to: dateRange.to,
    });
  };

  const canGenerate = !!dateRange.from && !!dateRange.to && !generateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <ReportsNav basePath={basePath} />

      <PageHeader
        title="توليد تقرير عند الطلب"
        description="أنشئ تقرير إنجاز أو متأخرات لأي فترة زمنية على الفور وعرضه وتصديره"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            إعدادات التوليد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="font-heading text-label-sm text-muted-foreground">
                نوع التقرير
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ReportType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACHIEVEMENT">
                    {getReportTypeLabel("ACHIEVEMENT")}
                  </SelectItem>
                  <SelectItem value="DELAY">
                    {getReportTypeLabel("DELAY")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="font-heading text-label-sm text-muted-foreground">
                الفترة الزمنية
              </Label>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              className="gap-2"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              <Zap className="size-4" />
              {generateMutation.isPending ? "جارٍ التوليد..." : "توليد الآن"}
            </Button>
          </div>
          {!dateRange.from || !dateRange.to ? (
            <p className="mt-3 text-label-sm text-muted-foreground">
              حدّد تاريخ البداية والنهاية لتتمكن من التوليد
            </p>
          ) : null}
        </CardContent>
      </Card>

      {generated && <GeneratedReportView report={generated} />}

      {!generated && !generateMutation.isPending && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Zap className="size-10 text-muted-foreground/40" />
          <p className="font-heading text-body-lg font-semibold text-foreground">
            لم يتم توليد أي تقرير بعد
          </p>
          <p className="text-body-sm text-muted-foreground">
            اختر نوع التقرير والفترة ثم اضغط «توليد الآن»
          </p>
        </div>
      )}
    </div>
  );
}
