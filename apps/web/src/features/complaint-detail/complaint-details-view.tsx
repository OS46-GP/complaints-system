import { Printer, MessageSquareReply, FileText } from "lucide-react";
import type { ComplaintDetailsData } from "@/features/complaint-detail/types";
import { ComplaintDescriptionCard } from "@/features/complaint-detail/complaint-description-card";
import { ComplaintEvidenceGallery } from "@/features/complaint-detail/complaint-evidence-gallery";
import { ComplaintTimeline } from "@/features/complaint-detail/complaint-timeline";
import { ComplaintMetaPanel } from "@/features/complaint-detail/complaint-meta-panel";
import { ComplaintQuickActions } from "@/features/complaint-detail/complaint-quick-actions";
import { Button } from "@/components/ui/button";

interface ComplaintDetailsViewProps {
  complaint: ComplaintDetailsData;
}

export function ComplaintDetailsView({ complaint }: ComplaintDetailsViewProps) {
  return (
    <>
      <div className="mb-6 md:mb-10 flex items-center justify-between">
        <div className="text-right">
          <h1 className="font-heading text-display-lg md:text-display-xl text-foreground mb-2">
            تفاصيل الشكوى
          </h1>
          <p className="font-body text-body-md md:text-body-lg text-muted-foreground">
            {complaint.displayId}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer className="size-4" />
          طباعة
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 w-full">
        <div className="col-span-12 lg:col-span-5 space-y-4 md:space-y-6">
          <ComplaintDescriptionCard
            subject={complaint.subject}
            annotation={complaint.annotation ?? ""}
          />
          {complaint.authorityResponseText && (
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquareReply className="size-5 text-primary" />
                <h3 className="font-heading text-headline-md text-foreground">رد الجهة المختصة</h3>
              </div>
              <p className="text-muted-foreground font-body text-body-md leading-relaxed whitespace-pre-wrap mb-3">
                {complaint.authorityResponseText}
              </p>
              <div className="flex items-center gap-4 text-label-xs text-muted-foreground">
                {complaint.incomingResponseNumber && (
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" />
                    {complaint.incomingResponseNumber}
                  </span>
                )}
                {complaint.authorityResponseDate && (
                  <span>{new Date(complaint.authorityResponseDate).toLocaleDateString("ar-SA")}</span>
                )}
              </div>
            </div>
          )}
          <ComplaintEvidenceGallery files={complaint.files} />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <ComplaintTimeline complaint={complaint} />
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4 md:space-y-6">
          <ComplaintMetaPanel complaint={complaint} />
          <ComplaintQuickActions complaintId={complaint.id} />
        </div>
      </div>
    </>
  );
}
