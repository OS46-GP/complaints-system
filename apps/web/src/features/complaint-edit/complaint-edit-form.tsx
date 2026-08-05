import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";

import type { ComplaintCreateFormData } from "@/features/complaint-create/types";
import {
  complaintEditSchema,
  emptyFormValues,
  STEP_FIELDS,
  type ComplaintCreateFormValues,
} from "@/features/complaint-create/validations";
import { mapDetailsToForm } from "@/features/complaint-edit/api";
import { useUpdateComplaint } from "@/features/complaint-edit/hooks";
import { useComplaint } from "@/features/complaint-detail/hooks";
import { AsyncLoader } from "@/components/shared/async-loader";
import { FormSkeleton } from "@/components/shared/form-skeleton";
import { PATHS } from "@/router/paths";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ComplaintStepper } from "@/features/complaint-create/complaint-stepper";
import { ComplaintBasicInfoStep } from "@/features/complaint-create/complaint-basic-info-step";
import { ComplaintCitizenStep } from "@/features/complaint-create/complaint-citizen-step";
import { ComplaintReviewStep } from "@/features/complaint-create/complaint-review-step";

const TOTAL_STEPS = 3;

const EDIT_STEP_FIELDS: (typeof STEP_FIELDS)[number][] = [
  STEP_FIELDS[0],
  STEP_FIELDS[1],
  [],
];

interface ComplaintEditFormProps {
  complaintId: string;
}

export function ComplaintEditForm({ complaintId }: ComplaintEditFormProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const listPath = pathname.startsWith("/user") ? PATHS.USER.COMPLAINTS : PATHS.ADMIN.COMPLAINTS;
  const updateMutation = useUpdateComplaint();
  const [step, setStep] = useState(1);

  const { data: details, isLoading, isError, refetch } = useComplaint(complaintId);

  const form = useForm<ComplaintCreateFormValues>({
    resolver: zodResolver(complaintEditSchema),
    defaultValues: emptyFormValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (details) {
      form.reset({ ...mapDetailsToForm(details), files: [] });
    }
  }, [details, form]);

  if (!details) {
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

  const handleNext = async () => {
    const isValid = await form.trigger(EDIT_STEP_FIELDS[step - 1]);
    if (!isValid) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (values: ComplaintCreateFormValues) => {
    const payload: ComplaintCreateFormData = {
      ...values,
      files: values.files.map((item) => item.file),
    };
    updateMutation.mutate(
      { id: complaintId, data: payload },
      {
        onSuccess: () => {
          toast.success("تم تحديث الشكوى بنجاح");
          navigate(listPath);
        },
        onError: () => {
          toast.error("حدث خطأ أثناء تحديث الشكوى");
        },
      },
    );
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-border p-4 md:p-8 shadow-xs">
              {step === 1 && <ComplaintBasicInfoStep />}
              {step === 2 && <ComplaintCitizenStep />}
              {step === 3 && <ComplaintReviewStep onGoToStep={setStep} />}

              <div className="mt-6 md:mt-10 flex flex-row-reverse justify-between items-center border-t border-border pt-4 md:pt-6">
                {step < TOTAL_STEPS ? (
                  <Button type="button" onClick={handleNext} className="gap-2">
                    التالي
                    <ArrowLeft className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        جارٍ الحفظ...
                      </>
                    ) : (
                      <>
                        حفظ التعديلات
                        <Save className="size-4" />
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
