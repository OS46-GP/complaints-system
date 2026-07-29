import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import type { FieldResult } from "@/features/complaint-list/types";
import { createComplaint } from "@/features/complaint-create/api";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { ComplaintStepper } from "@/features/complaint-create/complaint-stepper";
import { ComplaintBasicInfoStep } from "@/features/complaint-create/complaint-basic-info-step";
import { ComplaintDescriptionStep } from "@/features/complaint-create/complaint-description-step";
import { ComplaintAttachmentStep } from "@/features/complaint-create/complaint-attachment-step";
import { ComplaintReviewStep } from "@/features/complaint-create/complaint-review-step";

interface FileItem {
  file: File;
  id: string;
}

const DEFAULT_DATA: ComplaintCreateFormData = {
  subject: "",
  complaintTypeId: "",
  severity: "Medium",
  receptionMethodId: "",
  respondentName: "",
  departmentId: "",
  annotation: "",
  presentationStatusId: "",
  citizen: {
    fullName: "",
    nationalId: "",
    mobileNumber: "",
    address: "",
    village: "",
    district: "",
  },
  files: [],
};

function ocrFieldsToFormData(fields: Record<string, FieldResult>): Partial<ComplaintCreateFormData> {
  const get = (key: string) => fields[key]?.value ?? "";
  return {
    subject: get("subject") || undefined,
    severity: (get("severity") as "Low" | "Medium" | "High") || undefined,
    respondentName: get("respondentName") || undefined,
    annotation: get("annotation") || undefined,
    citizen: {
      fullName: get("citizenName") || get("fullName") || "",
      nationalId: get("nationalId") || undefined,
      mobileNumber: get("mobileNumber") || undefined,
      address: get("address") || undefined,
      village: get("village") || undefined,
      district: get("district") || undefined,
    },
  };
}

const TOTAL_STEPS = 4;

export function ComplaintCreateForm() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const queryClient = useQueryClient();
  const listPath = pathname.startsWith("/user") ? PATHS.USER.COMPLAINTS : PATHS.ADMIN.COMPLAINTS;
  const [step, setStep] = useState(1);

  const ocrData = (state as { ocrData?: Record<string, FieldResult> } | null)?.ocrData;
  const initialData = ocrData
    ? { ...DEFAULT_DATA, ...ocrFieldsToFormData(ocrData) }
    : DEFAULT_DATA;

  const [data, setData] = useState<ComplaintCreateFormData>(initialData);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = useCallback((partial: Partial<ComplaintCreateFormData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const canProceed = () => {
    if (step === 1) {
      if (!data.subject.trim()) return false;
      if (!data.citizen.fullName.trim()) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createComplaint({ ...data, files: files.map((f) => f.file) });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("تم تقديم الشكوى بنجاح");
      navigate(listPath);
    } catch {
      toast.error("حدث خطأ أثناء تقديم الشكوى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            تقديم شكوى جديدة
          </h1>
          <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
            يرجى تعبئة التفاصيل أدناه لمساعدتنا في معالجة شكواك بفعالية.
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          <ComplaintStepper currentStep={step} />
        </div>

        <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-border p-4 md:p-8 shadow-xs">
          {step === 1 && (
            <ComplaintBasicInfoStep data={data} onChange={updateData} />
          )}
          {step === 2 && (
            <ComplaintDescriptionStep data={data} onChange={updateData} />
          )}
          {step === 3 && (
            <ComplaintAttachmentStep files={files} onFilesChange={setFiles} />
          )}
          {step === 4 && (
            <ComplaintReviewStep
              data={data}
              files={files}
              onGoToStep={setStep}
            />
          )}

          <div className="mt-6 md:mt-10 flex flex-row-reverse justify-between items-center border-t border-border pt-4 md:pt-6">
            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                التالي
                <ArrowLeft className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? "جارٍ الإرسال..." : "إرسال الشكوى"}
                <Send className="size-4" />
              </Button>
            )}

            {step > 1 && (
              <Button variant="ghost" onClick={handlePrev} className="gap-2">
                <ArrowRight className="size-4" />
                السابق
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
