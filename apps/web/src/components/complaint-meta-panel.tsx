import {
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Badge,
  FileDigit,
  Hash,
} from "lucide-react";
import type { ComplaintDetailsData } from "@/types/complaint-details.types";

const severityLabels: Record<string, { label: string; color: string }> = {
  High: { label: "عالية جداً", color: "text-destructive" },
  Medium: { label: "متوسطة", color: "text-tertiary" },
  Low: { label: "عادية", color: "text-muted-foreground" },
};

const statusLabels: Record<string, string> = {
  NotFinished: "نشطة حالياً",
  Finished: "منتهية",
};

interface ComplaintMetaPanelProps {
  complaint: ComplaintDetailsData;
}

interface MetaRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function MetaRow({ icon, label, children }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-muted-foreground font-heading text-label-sm">
          {label}
        </span>
      </div>
      <div className="font-heading text-label-sm text-foreground">{children}</div>
    </div>
  );
}

export function ComplaintMetaPanel({ complaint }: ComplaintMetaPanelProps) {
  const severity = severityLabels[complaint.severity] || severityLabels.Low;
  const statusLabel = statusLabels[complaint.status] || "غير معروفة";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 md:p-6 bg-surface-container-high border-b border-border">
        <h4 className="font-heading text-label-sm text-foreground font-bold mb-3 uppercase tracking-wider">
          البيانات التعريفية
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-heading text-label-sm">الحالة</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[12px] flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary" />
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <MetaRow icon={<Hash className="size-4" />} label="رقم الشكوى">
          {complaint.complaintNumber}
        </MetaRow>

        <MetaRow icon={<FileDigit className="size-4" />} label="سنة البيان">
          {complaint.statementYear}
        </MetaRow>

        <MetaRow icon={<AlertTriangle className="size-4" />} label="الأولوية">
          <span className={severity.color}>{severity.label}</span>
        </MetaRow>

        <MetaRow icon={<User className="size-4" />} label="الوكيل المعني">
          {complaint.respondentName || "—"}
        </MetaRow>

        <MetaRow icon={<Building2 className="size-4" />} label="القسم">
          {complaint.departmentId || "—"}
        </MetaRow>

        <MetaRow icon={<Calendar className="size-4" />} label="تاريخ الفتح">
          {complaint.arrivalDate || "—"}
        </MetaRow>

        <MetaRow icon={<Badge className="size-4" />} label="تاريخ التحديث">
          {complaint.arrivalDate || "—"}
        </MetaRow>
      </div>
    </div>
  );
}
