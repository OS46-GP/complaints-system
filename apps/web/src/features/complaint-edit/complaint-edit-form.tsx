import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import { mapDetailsToForm } from "@/features/complaint-edit/api";
import { useUpdateComplaint } from "@/features/complaint-edit/hooks";
import { useComplaint } from "@/features/complaint-detail/hooks";
import { AsyncLoader } from "@/components/shared/async-loader";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { ComplaintStepper } from "@/features/complaint-create/complaint-stepper";
import { ComplaintBasicInfoStep } from "@/features/complaint-create/complaint-basic-info-step";
import { ComplaintDescriptionStep } from "@/features/complaint-create/complaint-description-step";
import { ComplaintReviewStep } from "@/features/complaint-create/complaint-review-step";

const TOTAL_STEPS = 3;

interface ComplaintEditFormProps {
  complaintId: string;
}

export function ComplaintEditForm({ complaintId }: ComplaintEditFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const listPath = pathname.startsWith("/user") ? PATHS.USER.COMPLAINTS : PATHS.ADMIN.COMPLAINTS;
  const updateMutation = useUpdateComplaint();

  const [step, setStep] = useState(1);
  const initialized = useRef(false);

  const { data: details, isLoading, isError, refetch } = useComplaint(complaintId);

  const [data, setData] = useState<ComplaintCreateFormData | null>(null);

  useEffect(() => {
    if (details && !initialized.current) {
      initialized.current = true;
      setData(mapDetailsToForm(details));
    }
  }, [details]);

  const updateData = useCallback((partial: Partial<ComplaintCreateFormData>) => {
    setData((prev) => prev ? { ...prev, ...partial } : prev);
  }, []);

  if (!data) {
    return (
      <AsyncLoader
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        errorText="تعذر تحميل بيانات الشكوى"
        skeleton={<FormSkeleton />}
      />
    );
  }

  const isFormValid =
    data.subject.trim().length > 0 &&
    data.citizen.fullName.trim().length > 0 &&
    data.citizen.nationalId.trim().length > 0;

  const canProceed = () => {
    if (step === 1) return isFormValid;
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
    try {
      await updateMutation.mutateAsync({ id: complaintId, data });
      toast.success("تم تحديث الشكوى بنجاح");
      navigate(listPath);
    } catch {
      toast.error("حدث خطأ أثناء تحديث الشكوى");
    }
  };

  return (
    <div className="w-full px-4 md:px-0">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-6 md:mb-10 text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            تعديل الشكوى
          </h1>
          <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
            قم بتعديل تفاصيل الشكوى أدناه.
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
            <ComplaintReviewStep
              data={data}
              files={[]}
              onGoToStep={setStep}
            />
          )}

          <div className="mt-6 md:mt-10 flex flex-row-reverse justify-between items-center border-t border-border pt-4 md:pt-6">
            <div className="flex gap-2">
              {step < TOTAL_STEPS ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                  التالي
                  <ArrowLeft className="size-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={updateMutation.isPending || !isFormValid} className="gap-2">
                  {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                  <Save className="size-4" />
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={updateMutation.isPending || !isFormValid}
                variant="outline"
                className="gap-2"
              >
                {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                <Save className="size-4" />
              </Button>
            </div>

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
