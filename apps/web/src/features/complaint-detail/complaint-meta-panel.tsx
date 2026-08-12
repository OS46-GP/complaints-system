import {
  AlertTriangle,
  Calendar,
  Badge,
  FileDigit,
  Hash,
  Sparkles,
} from "lucide-react";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";
import type { SeverityLevel } from "@/features/complaint-detail/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const severityLabels: Record<string, { label: string; color: string }> = {
  High: { label: "عالية", color: "text-destructive" },
  Medium: { label: "متوسطة", color: "text-tertiary" },
  Low: { label: "منخفضة", color: "text-muted-foreground" },
};

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: "HIGH", label: "عالية (عاجل)" },
  { value: "MEDIUM", label: "متوسطة" },
  { value: "LOW", label: "منخفضة" },
];

const caseStatusLabels: Record<string, { label: string; variant: string }> = {
  NOT_FINISHED: { label: "قيد الفحص", variant: "bg-warning/10 text-warning" },
  FINISHED: { label: "تم الفحص", variant: "bg-success/10 text-success" },
};

const SEVERITY_LEVEL: Record<string, SeverityLevel> = {
  High: "HIGH",
  Medium: "MEDIUM",
  Low: "LOW",
};

interface ComplaintMetaPanelProps {
  complaint: ComplaintDetailsData;
  aiSeverity?: SeverityLevel | null;
  isSeverityUpdating?: boolean;
  onSeverityChange?: (severity: SeverityLevel) => void;
}

export function ComplaintMetaPanel({
  complaint,
  aiSeverity,
  isSeverityUpdating,
  onSeverityChange,
}: ComplaintMetaPanelProps) {
  const severity = severityLabels[complaint.severity] ?? {
    label: complaint.severity,
    color: "text-foreground",
  };

  const aiSeveritySuggestion = aiSeverity
    ? severityLabels[aiSeverity.charAt(0) + aiSeverity.slice(1).toLowerCase()] ?? {
        label: aiSeverity,
        color: "text-foreground",
      }
    : null;

  const caseStatus = complaint.caseStatus
    ? caseStatusLabels[complaint.caseStatus] ?? { label: complaint.caseStatus, variant: "bg-muted text-muted-foreground" }
    : { label: complaint.examinationStatusName || "-", variant: "bg-muted text-muted-foreground" };

  const rows = [
    { icon: Hash, label: "رقم الشكوى", value: `#${complaint.complaintNumber}` },
    { icon: FileDigit, label: "سنة البيان", value: String(complaint.statementYear) },
    { icon: Calendar, label: "تاريخ الوصول", value: new Date(complaint.arrivalDate).toLocaleDateString("ar-SA") },
    {
      icon: Badge,
      label: "الحالة",
      value: (
        <span className={`inline-block px-2 py-0.5 rounded-full text-label-xs font-heading ${caseStatus.variant}`}>
          {caseStatus.label}
        </span>
      ),
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg">
      <h2 className="font-heading text-title-sm md:text-title-md text-foreground mb-4">
        معلومات الشكوى
      </h2>

      {onSeverityChange && (
        <div className="mb-4 p-3 rounded-lg bg-surface-container-low border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 font-heading text-label-sm text-foreground">
              <AlertTriangle className="size-4 text-primary" />
              درجة الخطورة
            </span>
            <span className={`font-body text-body-sm font-semibold ${severity.color}`}>
              {severity.label}
            </span>
          </div>
          <Select
            value={SEVERITY_LEVEL[complaint.severity] ?? "LOW"}
            onValueChange={(value) => onSeverityChange(value as SeverityLevel)}
            disabled={isSeverityUpdating}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="اختر درجة الخطورة" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {aiSeverity && aiSeverity !== SEVERITY_LEVEL[complaint.severity] && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 mt-0.5 shrink-0 text-primary" />
              توصية الذكاء الاصطناعي:{" "}
              <span className="font-semibold">{aiSeveritySuggestion?.label ?? aiSeverity}</span>
              {isSeverityUpdating && " — جارٍ الحفظ..."}
            </p>
          )}
        </div>
      )}

      <dl className="space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between">
              <dt className="flex items-center gap-2 font-heading text-label-sm text-muted-foreground">
                <Icon className="size-4" />
                {row.label}
              </dt>
              <dd className="font-body text-body-sm text-foreground text-left">
                {row.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}