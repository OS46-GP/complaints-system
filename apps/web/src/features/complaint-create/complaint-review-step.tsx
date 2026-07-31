import { useState } from "react";
import toast from "react-hot-toast";
import { Edit3, Info, AlertTriangle, CheckCircle2, SearchCheck } from "lucide-react";
import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import type { RecurrenceMatch } from "@/features/complaint-list/types";
import { complaintsApi } from "@/features/complaint-list/api";
import { RecurrenceMatchList } from "@/components/shared/recurrence-match-list";
import { Button } from "@/components/ui/button";

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
  const [checkState, setCheckState] = useState<{
    status: "idle" | "loading" | "done";
    matches: RecurrenceMatch[];
  }>({ status: "idle", matches: [] });

  const handleCheck = async () => {
    setCheckState({ status: "loading", matches: [] });
    try {
      const result = await complaintsApi.checkDuplicates({
        subject: data.subject,
        departmentId: data.departmentId || undefined,
        arrivalDate: new Date().toISOString(),
        citizen: {
          nationalId: data.citizen.nationalId || undefined,
          village: data.citizen.village || undefined,
          district: data.citizen.district || undefined,
        },
      });
      setCheckState({ status: "done", matches: result.recurrenceMatches });
    } catch {
      toast.error("تعذر التحقق من الشكاوى المشابهة");
      setCheckState({ status: "idle", matches: [] });
    }
  };

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
          label="الرقم القومي"
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

      <div className="rounded-xl border border-border bg-surface-container-lowest p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h3 className="font-heading text-title-sm text-foreground">
              التحقق من الشكاوى المشابهة
            </h3>
            <p className="font-body text-body-sm text-muted-foreground mt-1">
              تحقق من وجود شكاوى مكررة أو مشابهة قبل الإرسال.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCheck}
            disabled={checkState.status === "loading" || !data.subject.trim()}
            className="gap-2"
          >
            <SearchCheck className="size-4" />
            {checkState.status === "loading" ? "جارٍ التحقق..." : "التحقق من التكرار"}
          </Button>
        </div>

        {checkState.status === "done" &&
          (checkState.matches.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                <AlertTriangle className="size-5 shrink-0" />
                <p className="font-body text-body-md">
                  تم العثور على {checkState.matches.length} شكوى مشابهة. راجعها قبل الإرسال.
                </p>
              </div>
              <RecurrenceMatchList matches={checkState.matches} />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="size-5 shrink-0" />
              <p className="font-body text-body-md">لا توجد شكاوى مشابهة.</p>
            </div>
          ))}
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
