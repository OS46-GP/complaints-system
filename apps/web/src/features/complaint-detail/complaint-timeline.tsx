import { Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

interface ComplaintTimelineProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintTimeline({ complaint }: ComplaintTimelineProps) {
  const isFinished = complaint.caseStatus === "FINISHED";

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg h-full">
      <h2 className="font-heading text-title-sm md:text-title-md text-foreground mb-6">
        مسار الشكوى
      </h2>

      <div className="relative">
        <ol className="space-y-0">
          <li className="relative flex gap-4 pb-8">
            {!isFinished && (
              <div className="absolute right-[11px] top-6 bottom-0 w-px bg-border" />
            )}
            <div className="relative shrink-0">
              <div className={cn("size-6 rounded-full flex items-center justify-center", "bg-primary")}>
                <div className="size-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-label-sm text-foreground">تم تسجيل الشكوى</h3>
                <span className="text-label-xs text-primary font-heading">جاري</span>
              </div>
              <p className="text-body-sm text-muted-foreground mb-1">
                {complaint.subject}
              </p>
              <div className="flex items-center gap-3 text-label-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {complaint.createdBy || "النظام"}
                </span>
                <span>{new Date(complaint.createdAt).toLocaleDateString("ar-SA")}</span>
              </div>
            </div>
          </li>

          {isFinished && (
            <li className="relative flex gap-4 pb-8 last:pb-0">
              <div className="relative shrink-0">
                <div className={cn("size-6 rounded-full flex items-center justify-center", "bg-surface-container-high")}>
                  <Check className="size-3.5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-label-sm text-foreground">تم الفحص</h3>
                </div>
                <p className="text-body-sm text-muted-foreground mb-1">
                  {complaint.examinationStatusName || "تم الانتهاء من فحص الشكوى"}
                </p>
                <div className="flex items-center gap-3 text-label-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    النظام
                  </span>
                </div>
              </div>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
