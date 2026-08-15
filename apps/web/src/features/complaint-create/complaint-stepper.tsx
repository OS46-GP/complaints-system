import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  label: string;
  shortLabel: string;
}

const DEFAULT_STEPS: StepperStep[] = [
  { label: "بيانات المواطن", shortLabel: "مواطن" },
  { label: "بيانات الشكوى", shortLabel: "تفاصيل" },
  { label: "المرفقات", shortLabel: "مرفقات" },
  { label: "المراجعة", shortLabel: "مراجعة" },
];

interface ComplaintStepperProps {
  currentStep: number;
  steps?: StepperStep[];
}

export function ComplaintStepper({ currentStep, steps = DEFAULT_STEPS }: ComplaintStepperProps) {
  return (
    <div className="flex items-center justify-between w-full gap-0 md:gap-1">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none min-w-0">
            {index > 0 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 md:mx-3 transition-colors",
                  stepNumber <= currentStep ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1 md:gap-2">
              <div
                className={cn(
                  "size-8 md:size-10 rounded-full flex items-center justify-center font-bold transition-all text-sm md:text-base",
                  (isCompleted || isActive) && "bg-primary text-primary-foreground",
                  !isCompleted && !isActive && "bg-surface-container-highest text-on-surface-variant",
                )}
              >
                {isCompleted ? <Check className="size-4 md:size-5" /> : stepNumber}
              </div>
              <span className={cn(
                "font-heading whitespace-nowrap transition-all",
                isActive && "text-primary",
                !isActive && "text-on-surface-variant",
              )}>
                <span className="hidden md:inline text-label-sm">{step.label}</span>
                <span className="md:hidden text-[0.625rem] leading-none">{step.shortLabel}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}