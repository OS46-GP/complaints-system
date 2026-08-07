import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Send, Loader2, Trash2 } from "lucide-react";

import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import type { FieldResult } from "@/features/complaint-list/types";
import type { SocialDraft } from "@/features/social/types";
import { socialApi } from "@/features/social/api";
import {
  clearDraft,
  getDraft,
  setDraft,
  type ComplaintDraft,
} from "@/features/complaint-create/draft-store";
import {
  complaintCreateSchema,
  emptyFormValues,
  STEP_FIELDS,
  type ComplaintCreateFormValues,
} from "@/features/complaint-create/validations";
import { useCreateComplaint } from "@/features/complaint-create/hooks";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ComplaintStepper } from "@/features/complaint-create/complaint-stepper";
import { ComplaintBasicInfoStep } from "@/features/complaint-create/complaint-basic-info-step";
import { ComplaintCitizenStep } from "@/features/complaint-create/complaint-citizen-step";
import { ComplaintAttachmentStep } from "@/features/complaint-create/complaint-attachment-step";
import { ComplaintReviewStep } from "@/features/complaint-create/complaint-review-step";

const DEFAULT_DATA: ComplaintCreateFormValues = emptyFormValues;

function ocrFieldsToFormData(fields: Record<string, FieldResult>): Partial<ComplaintCreateFormValues> {
  const get = (key: string) => fields[key]?.value ?? "";
  return {
    subject: get("complaint_subject") || undefined,
    severity: (get("severity") as "Low" | "Medium" | "High") || undefined,
    complaintTypeId: get("complaint_typeId") || undefined,
    departmentId: get("complaint_departmentId") || undefined,
    annotation: get("complaint_annotation") || undefined,
    citizen: {
      fullName: get("citizen_fullName") || "",
      nationalId: get("citizen_nationalId") || "",
      mobileNumber: get("citizen_mobileNumber") || "",
      address: get("citizen_address") || "",
      village: get("citizen_village") || "",
      district: get("citizen_district") || "",
    },
  };
}

function socialDraftToFormData(draft: SocialDraft): Partial<ComplaintCreateFormValues> {
  const extracted = draft.extractedFields;
  if (extracted) {
    return {
      subject: extracted.subject.trim() || "شكوى من منشور على فيسبوك",
      annotation: extracted.annotation.trim() || draft.postText.trim(),
      severity: extracted.severity,
      citizen: {
        fullName: extracted.citizenFullName.trim() || draft.authorName || "",
        nationalId: extracted.citizenNationalId.trim() || "",
        mobileNumber: extracted.citizenMobileNumber.trim() || "",
        address: "",
        village: extracted.citizenVillage.trim() || "",
        district: extracted.citizenDistrict.trim() || "",
      },
    };
  }
  const subject = draft.postText.trim().slice(0, 200);
  return {
    subject: subject || "شكوى من منشور على فيسبوك",
    annotation: draft.postText.trim(),
    citizen: {
      fullName: draft.authorName || "",
      nationalId: "",
      mobileNumber: "",
      address: "",
      village: "",
      district: "",
    },
  };
}

const OCR_KEY_TO_FIELD: Record<string, string> = {
  complaint_subject: "subject",
  severity: "severity",
  complaint_typeId: "complaintTypeId",
  complaint_departmentId: "departmentId",
  complaint_annotation: "annotation",
  citizen_fullName: "citizen.fullName",
  citizen_nationalId: "citizen.nationalId",
  citizen_mobileNumber: "citizen.mobileNumber",
  citizen_address: "citizen.address",
  citizen_village: "citizen.village",
  citizen_district: "citizen.district",
};

const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  let current: unknown = obj;
  for (const part of path.split(".")) {
    if (current === null || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : "";
};

const TOTAL_STEPS = STEP_FIELDS.length;

function draftHasContent(draft: ComplaintDraft): boolean {
  if (draft.step !== 1) return true;
  const v = draft.values;
  return (
    v.subject !== "" ||
    v.complaintTypeId !== "" ||
    v.receptionMethodId !== "" ||
    v.departmentId !== "" ||
    v.annotation !== "" ||
    v.files.length > 0 ||
    Object.values(v.citizen).some((value) => value !== "")
  );
}

export function ComplaintCreateForm() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const listPath = pathname.startsWith("/user") ? PATHS.USER.COMPLAINTS : PATHS.ADMIN.COMPLAINTS;
  const createMutation = useCreateComplaint();

  const ocrData = (state as { ocrData?: Record<string, FieldResult> } | null)?.ocrData;
  const socialDraft = (state as { socialDraft?: SocialDraft } | null)?.socialDraft;

  const seedTag = ocrData
    ? `ocr:${JSON.stringify(ocrData)}`
    : socialDraft
      ? `social:${JSON.stringify(socialDraft)}`
      : "manual";

  const restoredDraft = useMemo(() => {
    const draft = getDraft();
    return draft && draft.seedTag === seedTag ? draft : null;
  }, [seedTag]);

  const ocrOriginal = useMemo(
    () => (ocrData ? (ocrFieldsToFormData(ocrData) as Partial<ComplaintCreateFormValues>) : null),
    [ocrData],
  );

  const socialOriginal = useMemo(
    () => (socialDraft ? socialDraftToFormData(socialDraft) : null),
    [socialDraft],
  );

  const [step, setStep] = useState(restoredDraft ? restoredDraft.step : 1);
  const [activeDraft, setActiveDraft] = useState<ComplaintDraft | null>(() => getDraft());
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const form = useForm<ComplaintCreateFormValues>({
    resolver: zodResolver(complaintCreateSchema),
    defaultValues: restoredDraft
      ? restoredDraft.values
      : ocrOriginal
        ? { ...DEFAULT_DATA, ...ocrOriginal }
        : socialOriginal
          ? { ...DEFAULT_DATA, ...socialOriginal }
          : DEFAULT_DATA,
    mode: "onTouched",
  });

  useEffect(() => {
    const draft = {
      seedTag,
      values: form.getValues(),
      step: stepRef.current,
      updatedAt: Date.now(),
    };
    setDraft(draft);
    setActiveDraft(draft);
    const subscription = form.watch((values) => {
      const nextDraft = {
        seedTag,
        values: values as ComplaintCreateFormValues,
        step: stepRef.current,
        updatedAt: Date.now(),
      };
      setDraft(nextDraft);
      setActiveDraft(nextDraft);
    });
    return () => subscription.unsubscribe();
  }, [form, seedTag]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const ocrFields = useMemo(() => {
    const fields = new Set<string>();
    if (!ocrOriginal) return fields;
    for (const field of new Set(Object.values(OCR_KEY_TO_FIELD))) {
      const ocrValue = getNestedValue(
        ocrOriginal as unknown as Record<string, unknown>,
        field,
      );
      if (ocrValue.trim()) fields.add(field);
    }
    return fields;
  }, [ocrOriginal]);

    const showClearDraft = !!activeDraft && draftHasContent(activeDraft);

  const handleNext = async () => {
    const isValid = await form.trigger(STEP_FIELDS[step - 1]);
    if (!isValid) return;
    setStep((s) => s + 1);
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleClearDraft = () => {
    form.reset(DEFAULT_DATA);
    clearDraft();
    setActiveDraft(null);
    setStep(1);
  };

  const handleSubmit = (values: ComplaintCreateFormValues) => {
    if (step < TOTAL_STEPS) return;
    const payload: ComplaintCreateFormData = {
      ...values,
      files: values.files.map((item) => item.file),
    };
    createMutation.mutate(payload, {
      onSuccess: (created) => {
        clearDraft();
        if (socialDraft?.id && created?.id) {
          socialApi.linkDraft(socialDraft.id, created.id).catch(() => {});
        }
        toast.success("تم تقديم الشكوى بنجاح");
        navigate(listPath);
      },
      onError: () => {
        toast.error("حدث خطأ أثناء تقديم الشكوى");
      },
    });
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 flex items-start justify-between gap-4">
          <div className="text-right">
            <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
              تقديم شكوى جديدة
            </h1>
            <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
              يرجى تعبئة التفاصيل أدناه لمساعدتنا في معالجة شكواك بفعالية.
            </p>
          </div>
          {showClearDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearDraft}
              className="gap-2 shrink-0"
              title="مسح البيانات المحفوظة والبدء من جديد"
            >
              <Trash2 className="size-4" />
              مسح المسودة
            </Button>
          )}
        </div>

        <div className="mb-6 md:mb-8">
          <ComplaintStepper currentStep={step} />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-border p-4 md:p-8 shadow-xs">
              {step === 1 && <ComplaintBasicInfoStep ocrFields={ocrFields} />}
              {step === 2 && <ComplaintCitizenStep ocrFields={ocrFields} />}
              {step === 3 && <ComplaintAttachmentStep />}
              {step === 4 && <ComplaintReviewStep ocrFields={ocrFields} onGoToStep={setStep} />}

              <div className="mt-6 md:mt-10 flex flex-row-reverse justify-between items-center border-t border-border pt-4 md:pt-6">
                {step < TOTAL_STEPS ? (
                  <Button key="next" type="button" onClick={handleNext} className="gap-2">
                    التالي
                    <ArrowLeft className="size-4" />
                  </Button>
                ) : (
                  <Button
                    key="submit"
                    type="submit"
                    disabled={createMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        جارٍ الإرسال...
                      </>
                    ) : (
                      <>
                        إرسال الشكوى
                        <Send className="size-4" />
                      </>
                    )}
                  </Button>
                )}

                {step > 1 && (
                  <Button type="button" variant="ghost" onClick={handlePrev} className="gap-2">
                    <ArrowRight className="size-4" />
                    السابق
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
