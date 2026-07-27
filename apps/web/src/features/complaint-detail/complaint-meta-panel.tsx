import {
  AlertTriangle,
  Building2,
  Calendar,
  Badge,
  FileDigit,
  Hash,
} from "lucide-react";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

const severityLabels: Record<string, { label: string; color: string }> = {
  High: { label: "عالية جداً", color: "text-destructive" },
  Medium: { label: "متوسطة", color: "text-tertiary" },
  Low: { label: "منخفضة", color: "text-muted-foreground" },
};

const statusLabels: Record<string, { label: string; variant: string }> = {
  NotFinished: { label: "غير منتهية", variant: "bg-warning/10 text-warning" },
  Finished: { label: "منتهية", variant: "bg-success/10 text-success" },
  Suspended: { label: "معلقة", variant: "bg-secondary/10 text-secondary" },
  Referral: { label: "محالة", variant: "bg-info/10 text-info" },
  Archived: { label: "مؤرشفة", variant: "bg-muted text-muted-foreground" },
};

interface ComplaintMetaPanelProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintMetaPanel({ complaint }: ComplaintMetaPanelProps) {
  const severity = severityLabels[complaint.severity] ?? {
    label: complaint.severity,
    color: "text-foreground",
  };
  const status = statusLabels[complaint.status] ?? {
    label: complaint.status,
    variant: "bg-muted text-muted-foreground",
  };

  const rows = [
    { icon: Hash, label: "رقم الشكوى", value: complaint.complaintNumber },
    { icon: FileDigit, label: "سنة البيان", value: String(complaint.statementYear) },
    { icon: Calendar, label: "تاريخ الوصول", value: complaint.arrivalDate },
    { icon: Building2, label: "الجهة المختصة", value: complaint.departmentId },
    {
      icon: AlertTriangle,
      label: "درجة الخطورة",
      value: (
        <span className={severity.color}>{severity.label}</span>
      ),
    },
    {
      icon: Badge,
      label: "الحالة",
      value: (
        <span className={`inline-block px-2 py-0.5 rounded-full text-label-xs font-heading ${status.variant}`}>
          {status.label}
        </span>
      ),
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg">
      <h2 className="font-heading text-title-sm md:text-title-md text-foreground mb-4">
        معلومات الشكوى
      </h2>
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
