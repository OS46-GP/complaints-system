import { Check, User, MessageSquareReply } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";

interface ComplaintTimelineProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintTimeline({ complaint }: ComplaintTimelineProps) {
  const hasResponse = !!complaint.authorityResponseText;

  return (
    <section className="rounded-xl border border-border bg-surface-container-lowest p-stack-lg h-full">
      <h2 className="font-heading text-title-sm md:text-title-md text-foreground mb-6">
        مسار الشكوى
      </h2>

      <div className="relative">
        <ol className="space-y-0">
          <li className="relative flex gap-4 pb-8">
            {!hasResponse && (
              <div className="absolute right-[11px] top-6 bottom-0 w-px bg-border" />
            )}
            <div className="relative shrink-0">
              <div className={cn("size-6 rounded-full flex items-center justify-center", hasResponse ? "bg-surface-container-high" : "bg-primary")}>
                {hasResponse ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <div className="size-2 rounded-full bg-white animate-pulse" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-label-sm text-foreground">تم تسجيل الشكوى</h3>
                {!hasResponse && (
                  <span className="text-label-xs text-primary font-heading">جاري</span>
                )}
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

          <li className={cn("relative flex gap-4", hasResponse ? "pb-0" : "pb-8")}>
            {complaint.examinationStatusName && !hasResponse && (
              <div className="absolute right-[11px] top-6 bottom-0 w-px bg-border" />
            )}
            <div className="relative shrink-0">
              <div className={cn("size-6 rounded-full flex items-center justify-center", complaint.examinationStatusName ? "bg-surface-container-high" : "bg-border/50")}>
                {complaint.examinationStatusName ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <div className="size-2 rounded-full bg-border" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-label-sm text-foreground">فحص الشكوى</h3>
                {complaint.examinationStatusName && (
                  <span className="text-label-xs text-primary font-heading">تم</span>
                )}
              </div>
              <p className="text-body-sm text-muted-foreground">
                {complaint.examinationStatusName || "لم يتم الفحص بعد"}
              </p>
            </div>
          </li>

          {hasResponse && (
            <li className="relative flex gap-4 pt-8 last:pb-0">
              <div className="relative shrink-0">
                <div className="size-6 rounded-full flex items-center justify-center bg-primary">
                  <MessageSquareReply className="size-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-label-sm text-foreground">تم إضافة الرد</h3>
                </div>
                <p className="text-body-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                  {complaint.authorityResponseText}
                </p>
                <div className="flex items-center gap-3 text-label-xs text-muted-foreground">
                  {complaint.incomingResponseNumber && (
                    <span>رقم الرد: {complaint.incomingResponseNumber}</span>
                  )}
                  {complaint.authorityResponseDate && (
                    <span>{new Date(complaint.authorityResponseDate).toLocaleDateString("ar-SA")}</span>
                  )}
                </div>
              </div>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
