import { Edit3, Info } from "lucide-react";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";

interface FileItem {
  file: File;
  id: string;
}

interface ComplaintReviewStepProps {
  data: ComplaintCreateFormData;
  files: FileItem[];
  onGoToStep: (step: number) => void;
}

const SEVERITY_LABELS: Record<string, string> = {
  High: "عاجل",
  Medium: "متوسط",
  Low: "عادي",
};

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-border pb-4 last:border-b-0 last:pb-0 gap-2 md:gap-0">
      <button
        type="button"
        onClick={onEdit}
        className="text-primary hover:underline font-heading text-label-sm flex items-center gap-1 self-start order-2 md:order-1"
      >
        <Edit3 className="size-3.5" />
        تعديل
      </button>
      <div className="text-right order-1 md:order-2">
        <span className="block font-heading text-label-sm text-muted-foreground mb-1">
          {label}
        </span>
        <p className="font-body text-body-md text-foreground break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

export function ComplaintReviewStep({ data, files, onGoToStep }: ComplaintReviewStepProps) {
  const fileNames = files.map((f) => f.file.name);

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low rounded-lg p-6 space-y-4">
        <ReviewRow
          label="الموضوع"
          value={data.subject || "لم يتم إدخال عنوان"}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="الأولوية"
          value={SEVERITY_LABELS[data.severity] || "—"}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="المواطن"
          value={data.citizen.fullName || "—"}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="رقم الهوية"
          value={data.citizen.nationalId || "—"}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="رقم الجوال"
          value={data.citizen.mobileNumber || "—"}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="وصف الشكوى"
          value={data.annotation || "لا يوجد وصف متاح"}
          onEdit={() => onGoToStep(2)}
        />
        <ReviewRow
          label="المرفقات"
          value={
            fileNames.length > 0
              ? fileNames.join("، ")
              : "لا توجد مرفقات"
          }
          onEdit={() => onGoToStep(3)}
        />
      </div>

      <div className="flex items-center gap-2 p-4 bg-primary-container/10 rounded-lg">
        <Info className="size-5 text-primary shrink-0" />
        <p className="font-body text-body-md text-muted-foreground">
          بمجرد الضغط على "إرسال الشكوى"، سيتم تعيين رقم مرجعي لطلبك وإرسال تأكيد إلى بريدك الإلكتروني.
        </p>
      </div>
    </div>
  );
}
