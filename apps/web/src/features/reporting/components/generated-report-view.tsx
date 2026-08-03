import { useState } from "react";
import { CalendarClock, FileBarChart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ExportButtons } from "@/features/reporting/components/export-buttons";
import { openDownload } from "@/features/reporting/download";
import { AchievementSection } from "@/features/reporting/components/achievement-section";
import { DelaySection } from "@/features/reporting/components/delay-section";
import { useExportReport } from "@/features/reporting/hooks";
import {
  getReportTypeLabel,
  type AchievementReport,
  type DelayReport,
  type ExportFormat,
  type GeneratedReport,
} from "@/features/reporting/types";

interface GeneratedReportViewProps {
  report: GeneratedReport;
}

export function GeneratedReportView({ report }: GeneratedReportViewProps) {
  const exportMutation = useExportReport();
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = (format: ExportFormat) => {
    setExportingFormat(format);
    exportMutation.mutate(
      { id: report.id, format },
      {
        onSuccess: (result) => {
          setExportingFormat(null);
          openDownload(result);
        },
        onError: () => {
          setExportingFormat(null);
        },
      },
    );
  };

  const isAchievement = report.type === "ACHIEVEMENT";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 font-heading text-title-sm text-foreground">
              <FileBarChart className="size-5 text-primary" />
              {getReportTypeLabel(report.type)}
            </h3>
            <p className="text-label-sm text-muted-foreground">
              {report.periodLabel}
            </p>
            <p className="inline-flex items-center gap-1.5 text-label-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              تاريخ التوليد:{" "}
              {new Date(report.generatedAt).toLocaleString("ar-SA")}
            </p>
          </div>

          <ExportButtons
            onExport={handleExport}
            isExporting={exportingFormat}
          />
        </CardContent>
      </Card>

      {isAchievement ? (
        <AchievementSection report={report.data as AchievementReport} />
      ) : (
        <DelaySection report={report.data as DelayReport} />
      )}
    </div>
  );
}
