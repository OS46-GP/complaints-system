import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2,
  SearchCheck,
  Sparkles,
} from "lucide-react";
import type { ComplaintCreateFormValues } from "@/features/complaint-create/validations";
import type { RecurrenceMatch, ApiComplaint } from "@/features/complaint-list/types";
import { complaintsApi } from "@/features/complaint-list/api";
import { useDepartments } from "@/features/complaint-list/hooks";
import { RecurrenceMatchList } from "@/components/shared/recurrence-match-list";
import { BulletList } from "@/components/shared/bullet-list";
import { ComplaintPreviewDialog } from "@/features/complaint-create/complaint-preview-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComplaintReviewStepProps {
  ocrFields?: Set<string>;
  onGoToStep: (step: number) => void;
}

const SEVERITY_LABELS: Record<string, string> = {
  High: "عاجل",
  Medium: "متوسط",
  Low: "عادي",
};

const SEVERITY_OPTIONS: { value: "High" | "Medium" | "Low"; label: string }[] = [
  { value: "High", label: "عاجل" },
  { value: "Medium", label: "متوسط" },
  { value: "Low", label: "عادي" },
];

function ReviewRow({
  label,
  value,
  items,
  onEdit,
  isOcr,
}: {
  label: string;
  value?: string;
  items?: string[];
  onEdit: () => void;
  isOcr?: boolean;
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
          {isOcr && (
            <span className="inline-block mr-2 align-middle px-1.5 py-0.5 rounded bg-success/15 text-success text-[0.625rem] leading-none font-semibold">
              OCR
            </span>
          )}
        </span>
        {items && items.length > 0 ? (
          <BulletList items={items} />
        ) : (
          <p className="font-body text-body-md text-foreground break-words">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

export function ComplaintReviewStep({ ocrFields, onGoToStep }: ComplaintReviewStepProps) {
  const form = useFormContext<ComplaintCreateFormValues>();
  const { data: departments } = useDepartments();
  const subject = useWatch({ control: form.control, name: "subject" });
  const severity = useWatch({ control: form.control, name: "severity" });
  const citizenFullName = useWatch({ control: form.control, name: "citizen.fullName" });
  const citizenNationalId = useWatch({ control: form.control, name: "citizen.nationalId" });
  const citizenMobileNumber = useWatch({ control: form.control, name: "citizen.mobileNumber" });
  const annotation = useWatch({ control: form.control, name: "annotation" });
  const departmentsWatch = useWatch({ control: form.control, name: "departments" }) ?? [];
  const fileItems = useWatch({ control: form.control, name: "files" }) ?? [];
  const departmentNames = departmentsWatch
    .map(
      (assignment) =>
        departments?.find((department) => department.id === assignment.departmentId)?.name,
    )
    .filter((name): name is string => Boolean(name));
  const isOcr = (field: string) => ocrFields?.has(field) ?? false;
  const fileNames = fileItems.map((f) => f.file.name);
  const [checkState, setCheckState] = useState<{
    status: "idle" | "loading" | "done";
    matches: RecurrenceMatch[];
    aiSeverity: "Low" | "Medium" | "High" | null;
  }>({ status: "idle", matches: [], aiSeverity: null });
  const autoChecked = useRef(false);
  const [selectedForPreview, setSelectedForPreview] = useState<ApiComplaint | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const openPreview = async (match: RecurrenceMatch) => {
    if (previewLoadingId) return;
    setPreviewLoadingId(match.id);
    try {
      const complaint = await complaintsApi.getById(match.id);
      setSelectedForPreview(complaint);
    } catch {
      toast.error("تعذر جلب بيانات الشكوى");
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const runCheck = async () => {
    const values = form.getValues();
    setCheckState({ status: "loading", matches: [], aiSeverity: null });
    try {
      const result = await complaintsApi.checkDuplicates({
        subject: values.subject,
        annotation: values.annotation || undefined,
        departmentId: values.departments[0]?.departmentId || undefined,
        arrivalDate: new Date().toISOString(),
        citizen: {
          nationalId: values.citizen.nationalId || undefined,
          village: values.citizen.village || undefined,
          district: values.citizen.district || undefined,
        },
      });
      const aiSeverity = result.severity;
      setCheckState({ status: "done", matches: result.recurrenceMatches, aiSeverity });
      form.setValue("severity", aiSeverity ?? "Medium", {
        shouldValidate: true,
      });
    } catch {
      if (!autoChecked.current) {
        setCheckState({ status: "idle", matches: [], aiSeverity: null });
      } else {
        toast.error("تعذر التحقق من الشكاوى المشابهة");
        setCheckState({ status: "idle", matches: [], aiSeverity: null });
      }
    }
  };

  useEffect(() => {
    if (autoChecked.current || !subject.trim()) return;
    autoChecked.current = true;
    void runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low rounded-lg p-6 space-y-4">
        <ReviewRow
          label="الموضوع"
          value={subject || "لم يتم إدخال عنوان"}
          isOcr={isOcr("subject")}
          onEdit={() => onGoToStep(2)}
        />
        <ReviewRow
          label="المواطن"
          value={citizenFullName || "—"}          isOcr={isOcr("citizen.fullName")}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="الرقم القومي"
          value={citizenNationalId || "—"}
          isOcr={isOcr("citizen.nationalId")}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="رقم الجوال"
          value={citizenMobileNumber || "—"}
          isOcr={isOcr("citizen.mobileNumber")}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewRow
          label="الجهات المعنية"
          items={departmentNames}
          isOcr={isOcr("departmentId")}
          onEdit={() => onGoToStep(2)}
        />
        <ReviewRow
          label="وصف الشكوى"
          value={annotation || "لا يوجد وصف متاح"}
          isOcr={isOcr("annotation")}
          onEdit={() => onGoToStep(2)}
        />
        <ReviewRow
          label="المرفقات"
          items={fileNames}
          value={fileNames.length > 0 ? undefined : "لا توجد مرفقات"}
          onEdit={() => onGoToStep(3)}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface-container-lowest p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h3 className="font-heading text-title-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              التحقق الذكي من الشكاوى المشابهة
            </h3>
            <p className="font-body text-body-sm text-muted-foreground mt-1">
              يفحص النظام قاعدة البيانات باستخدام الذكاء الاصطناعي لاكتشاف شكاوى مشابهة وتقييم درجة الخطورة تلقائياً قبل الإرسال.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={runCheck}
            disabled={checkState.status === "loading" || !subject.trim()}
            className="gap-2"
          >
            <SearchCheck className="size-4" />
            {checkState.status === "loading"
              ? "جارٍ التحقق..."
              : checkState.status === "done"
                ? "إعادة التحقق"
                : "التحقق من التكرار"}
          </Button>
        </div>

        {checkState.status === "loading" && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            <p className="font-body text-body-md text-muted-foreground">
              جارٍ فحص الشكاوى المشابهة بالذكاء الاصطناعي...
            </p>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <h3 className="font-heading text-label-sm text-foreground flex items-center gap-1.5 mb-2">
            <Sparkles className="size-4 text-primary" />
            درجة الخطورة
          </h3>
          <div className="flex gap-2">
            {SEVERITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  form.setValue("severity", option.value, { shouldValidate: true })
                }
                className={cn(
                  "flex-1 h-11 border rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all font-heading text-label-sm px-1",
                  severity === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-input bg-surface-container-low hover:bg-surface-container-high",
                )}
              >
                {SEVERITY_LABELS[option.value]}
              </button>
            ))}
          </div>
          {checkState.aiSeverity && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 mt-0.5 shrink-0 text-primary" />
              التوصية التلقائية:{" "}
              <span className="font-semibold">
                {SEVERITY_LABELS[checkState.aiSeverity]}
              </span>
              {" "}— يمكنك تعديلها أعلاه قبل الإرسال.
            </p>
          )}
          {!checkState.aiSeverity && (
            <p className="mt-2 text-xs text-muted-foreground">
              حدد درجة الخطورة أو انتظر توصية الذكاء الاصطناعي عند التحقق.
            </p>
          )}
        </div>

        {checkState.status === "done" && (
          <div className="mt-4">
            {checkState.matches.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                  <AlertTriangle className="size-5 shrink-0" />
                  <p className="font-body text-body-md">
                    تم العثور على {checkState.matches.length} شكوى مشابهة. راجعها قبل الإرسال.
                  </p>
                </div>
                <RecurrenceMatchList
                  matches={checkState.matches}
                  onSelect={openPreview}
                  isLoading={previewLoadingId !== null}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="size-5 shrink-0" />
                <p className="font-body text-body-md">
                  لا توجد شكاوى مشابهة في قاعدة البيانات.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ComplaintPreviewDialog
        open={!!selectedForPreview}
        onOpenChange={(open) => {
          if (!open) setSelectedForPreview(null);
        }}
        complaint={selectedForPreview}
      />
    </div>
  );
}
